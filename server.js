const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const app = express();

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

app.use(express.urlencoded({ extended: true }));

app.get("/",(req,res)=>
{
    res.send("Hello Expense App!");
});

app.get("/signup", (req, res)=>
{
    res.sendFile(path.join(__dirname, "public", "signup.html"));
}); 


// Handle signup button click
app.post("/signup", (req, res) => {

    const { name, email, password } = req.body;

    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;

 db.query(sql, [name, email, password], (err, result) => {

        if (err) {
            console.log("Error:", err);
            return res.send("Signup failed. Email may already exist.");
        }

        console.log("User created successfully!");

        res.send(`
            <h1>Signup Successful!</h1>
            <p>Welcome, ${name}!</p>
            <p>Your account has been created successfully.</p>
            <a href="/signup">Go Back</a>
        `);
 });
});


app.listen(3000, ()=>
{
    console.log("Server is running on port 3000");
});
