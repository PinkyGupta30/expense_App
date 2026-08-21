const express = require("express");
const path = require("path");
const mysql = require("mysql2");

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

    db.query(checkUserSql, [email], (err, results) => {

        // Database error
        if (err) {
            console.log("Error:", err);
            return res.send("Something went wrong");
        }

        // User already exists
        if (results.length > 0) {
            return res.send("User already exists");
        }

        // Insert new user
        const insertUserSql = `
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `;

        db.query(insertUserSql, [name, email, password], (err, result) => {

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
        });
    });
});
// Show login page
app.get("/login", (req, res) =>
{
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Handle signin
app.post("/login", (req, res) => {

    // Get data from frontend form
    const { email, password } = req.body;

    // find user using email
    const checkUserSql = "SELECT * FROM users WHERE email = ?";

    db.query(checkUserSql, [email], (err, results) => {

        // Database error
        if (err) {
            console.log("Error:", err);
            return res.send("something went wrong");
        }

        // User does not exists
        if (results.length === 0) 
        {
            return res.send("User not found");
        }

        // get user from db

        const user = results[0];

        //compare pwd

        if(user.password === password)
        {
            console.log("user logged in successfully");

            return res.send(`
                <h1>Login Successful!</h1>
                <p>Welcome, ${user.name}!</p>
                <p>You have logged in successfully.</p>
                <a href="/login">Go Back</a>
                `)
        }
        else
        {
            return res.send("Invalid password");
        }

    });
});


// Start server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});