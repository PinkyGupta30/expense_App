const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();

// MySQL database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "expense_app"
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database!");
    }
});

// Read form data
app.use(express.urlencoded({ extended: true }));

// Home route
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

    // Get data from frontend form
    const { name, email, password } = req.body;

    // Check whether the user already exists
    const checkUserSql = "SELECT * FROM users WHERE email = ?";

    db.query(checkUserSql, [email], async (err, results) => {

        // Database error
        if (err) {
            console.log("Error:", err);
            return res.send("Something went wrong");
        }

        // User already exists
        if (results.length > 0) {
            return res.send("User already exists");
        }

        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
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
                        return res.send("Signup failed");
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

    // Receive email and password from frontend
    const { email, password } = req.body;

    // Check whether the user exists
    const checkUserSql = "SELECT * FROM users WHERE email = ?";

    db.query(checkUserSql, [email], async (err, results) => {

        // Database error
        if (err) {
            console.log("Error:", err);
            return res.status(500).send("Something went wrong");
        }

        // User does not exist
        if (results.length === 0) {
            return res.status(404).send("User not found");
        }

        try {
            // Get user from database
            const user = results[0];

            // Compare entered password with stored hashed password
            const isPasswordMatch = await bcrypt.compare(
                password,
                user.password
            );

            // Password does not match
            if (!isPasswordMatch) {
                return res.status(401).send("User not authorized");
            }

            // Login successful
            console.log("User logged in successfully");

            return res.status(200).send("User login successful");

        } catch (error) {
            console.log("Password comparison error:", error);

            return res.status(500).send("Something went wrong");
        }
    });
});

// ==================== START SERVER ====================

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});