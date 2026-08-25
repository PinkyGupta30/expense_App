const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authenticate = require("./middleware/auth");

const app = express();

// ==================== DATABASE CONNECTION ====================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "expense_app"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database!");
    }
});

// ==================== MIDDLEWARE ====================

// Read normal HTML form data
app.use(express.urlencoded({ extended: true }));

// Read JSON data
app.use(express.json());

// ==================== HOME ====================

app.get("/", (req, res) => {
    res.send("Hello Expense App!");
});

// ==================== SIGNUP ====================

// Show signup page
app.get("/signup", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "signup.html")
    );
});

// Handle signup
app.post("/signup", (req, res) => {

    const { name, email, password } = req.body;

    const checkUserSql =
        "SELECT * FROM users WHERE email = ?";

    db.query(
        checkUserSql,
        [email],
        async (err, results) => {

            if (err) {
                console.log("Error:", err);
                return res.status(500).send("Something went wrong");
            }

            // User already exists
            if (results.length > 0) {
                return res.send("User already exists");
            }

            try {

                // Hash password
                const hashedPassword =
                    await bcrypt.hash(password, 10);

                const insertUserSql = `
                    INSERT INTO users (name, email, password)
                    VALUES (?, ?, ?)
                `;

                db.query(
                    insertUserSql,
                    [name, email, hashedPassword],
                    (err, result) => {

                        if (err) {
                            console.log("Error:", err);
                            return res.status(500).send("Signup failed");
                        }

                        console.log("User created successfully!");

                        return res.send(`
                            <h1>Signup Successful!</h1>
                            <p>Welcome, ${name}!</p>
                            <p>Your account has been created successfully.</p>
                            <a href="/login">Login</a>
                        `);
                    }
                );

            } catch (error) {

                console.log(
                    "Password hashing error:",
                    error
                );

                return res.status(500).send(
                    "Something went wrong"
                );
            }
        }
    );
});

// ==================== LOGIN ====================

// Show login page
app.get("/login", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "login.html")
    );
});

// Handle login
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const checkUserSql =
        "SELECT * FROM users WHERE email = ?";

    db.query(
        checkUserSql,
        [email],
        async (err, results) => {

            if (err) {
                console.log("Error:", err);

                return res.status(500).json({
                    message: "Something went wrong"
                });
            }

            // User not found
            if (results.length === 0) {

                return res.status(404).json({
                    message: "User not found"
                });
            }

            try {

                const user = results[0];

                // Compare entered password
                // with bcrypt hashed password
                const isPasswordMatch =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                // Password incorrect
                if (!isPasswordMatch) {

                    return res.status(401).json({
                        message: "User not authorized"
                    });
                }

                // ====================
                // GENERATE JWT TOKEN
                // ====================

                const token = jwt.sign(
                    {
                        userId: user.id,
                        email: user.email
                    },
                    "my_secret_key",
                    {
                        expiresIn: "1h"
                    }
                );

                console.log(
                    "User logged in successfully"
                );

                // Send token to frontend
                return res.status(200).json({
                    message: "Login successful",
                    token: token
                });

            } catch (error) {

                console.log(
                    "Login error:",
                    error
                );

                return res.status(500).json({
                    message: "Something went wrong"
                });
            }
        }
    );
});

// ==================== EXPENSE PAGE ====================

// Show expense page
app.get("/expenses", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "expense.html"
        )
    );
});

// ==================== ADD EXPENSE ====================

// authenticate middleware runs first
app.post(
    "/api/expenses",
    authenticate,
    (req, res) => {

        const {
            amount,
            description,
            category
        } = req.body;

        // Get logged-in user ID
        // from verified JWT token
        const userId = req.user.userId;

        // Validate fields
        if (!amount || !description || !category) {

            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const insertExpenseSql = `
            INSERT INTO expenses
            (amount, description, category, user_id)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            insertExpenseSql,
            [
                amount,
                description,
                category,
                userId
            ],
            (err, result) => {

                if (err) {

                    console.log(
                        "Error adding expense:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Expense could not be added"
                    });
                }

                return res.status(201).json({

                    message:
                        "Expense added successfully",

                    expense: {
                        id: result.insertId,
                        amount: amount,
                        description: description,
                        category: category,
                        user_id: userId
                    }
                });
            }
        );
    }
);

// ==================== GET USER EXPENSES ====================

// authenticate middleware runs first
app.get(
    "/api/expenses",
    authenticate,
    (req, res) => {

        // Get logged-in user ID from token
        const userId = req.user.userId;

        // Fetch ONLY this user's expenses
        const getExpensesSql = `
            SELECT *
            FROM expenses
            WHERE user_id = ?
            ORDER BY id DESC
        `;

        db.query(
            getExpensesSql,
            [userId],
            (err, results) => {

                if (err) {

                    console.log(
                        "Error fetching expenses:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Could not fetch expenses"
                    });
                }

                return res.status(200).json(results);
            }
        );
    }
);

// ==================== DELETE EXPENSE ====================

// Only delete expense belonging
// to the logged-in user
app.delete(
    "/api/expenses/:id",
    authenticate,
    (req, res) => {

        const expenseId = req.params.id;

        // Get user ID from verified token
        const userId = req.user.userId;

        const deleteExpenseSql = `
            DELETE FROM expenses
            WHERE id = ?
            AND user_id = ?
        `;

        db.query(
            deleteExpenseSql,
            [expenseId, userId],
            (err, result) => {

                if (err) {

                    console.log(
                        "Error deleting expense:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Expense could not be deleted"
                    });
                }

                // Expense doesn't exist
                // or belongs to another user
                if (result.affectedRows === 0) {

                    return res.status(403).json({
                        message:
                            "You are not authorized to delete this expense"
                    });
                }

                return res.status(200).json({
                    message:
                        "Expense deleted successfully"
                });
            }
        );
    }
);

// ==================== START SERVER ====================

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});