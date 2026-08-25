const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

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
    res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// Handle signup
app.post("/signup", (req, res) => {

    const { name, email, password } = req.body;

    const checkUserSql = "SELECT * FROM users WHERE email = ?";

    db.query(checkUserSql, [email], async (err, results) => {

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
            const hashedPassword = await bcrypt.hash(password, 10);

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

                    res.send(`
                        <h1>Signup Successful!</h1>
                        <p>Welcome, ${name}!</p>
                        <p>Your account has been created successfully.</p>
                        <a href="/login">Login</a>
                    `);
                }
            );

        } catch (error) {

            console.log("Password hashing error:", error);

            return res.status(500).send("Something went wrong");
        }
    });
});

// ==================== LOGIN ====================

// Show login page
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Handle login
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const checkUserSql = "SELECT * FROM users WHERE email = ?";

    db.query(checkUserSql, [email], async (err, results) => {

        if (err) {
            console.log("Error:", err);
            return res.status(500).send("Something went wrong");
        }

        // User not found
        if (results.length === 0) {
            return res.status(404).send("User not found");
        }

        try {
            const user = results[0];

            // Compare normal password with bcrypt hash
            const isPasswordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isPasswordMatch) {
                return res.status(401).send("User not authorized");
            }

            console.log("User logged in successfully");

            // Redirect after successful login
            return res.redirect("/expenses");

        } catch (error) {

            console.log("Password comparison error:", error);

            return res.status(500).send("Something went wrong");
        }
    });
});

// ==================== EXPENSE PAGE ====================

// Show expense page
app.get("/expenses", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "expense.html")
    );
});

// ==================== ADD EXPENSE ====================

// Add expense to database
app.post("/api/expenses", (req, res) => {

    const { amount, description, category } = req.body;

    // Validate fields
    if (!amount || !description || !category) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const insertExpenseSql = `
        INSERT INTO expenses (amount, description, category)
        VALUES (?, ?, ?)
    `;

    db.query(
        insertExpenseSql,
        [amount, description, category],
        (err, result) => {

            if (err) {
                console.log("Error adding expense:", err);

                return res.status(500).json({
                    message: "Expense could not be added"
                });
            }

            return res.status(201).json({
                message: "Expense added successfully",
                expense: {
                    id: result.insertId,
                    amount: amount,
                    description: description,
                    category: category
                }
            });
        }
    );
});

// ==================== GET ALL EXPENSES ====================

// Fetch expenses from database
app.get("/api/expenses", (req, res) => {

    const getExpensesSql = `
        SELECT * FROM expenses
        ORDER BY id DESC
    `;

    db.query(getExpensesSql, (err, results) => {

        if (err) {
            console.log("Error fetching expenses:", err);

            return res.status(500).json({
                message: "Could not fetch expenses"
            });
        }

        return res.status(200).json(results);
    });
});

// ==================== START SERVER ====================

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});