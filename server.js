const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cashfree = require("./services/cashfreeService");
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

                return res.status(500).send(
                    "Something went wrong"
                );
            }

            // User already exists
            if (results.length > 0) {

                return res.send(
                    "User already exists"
                );
            }

            try {

                // Hash password
                const hashedPassword =
                    await bcrypt.hash(password, 10);


                const insertUserSql = `
                    INSERT INTO users
                    (name, email, password)
                    VALUES (?, ?, ?)
                `;


                db.query(
                    insertUserSql,
                    [
                        name,
                        email,
                        hashedPassword
                    ],
                    (err, result) => {

                        if (err) {

                            console.log(
                                "Error:",
                                err
                            );

                            return res.status(500).send(
                                "Signup failed"
                            );
                        }


                        console.log(
                            "User created successfully!"
                        );


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
        path.join(
            __dirname,
            "public",
            "login.html"
        )
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

                console.log(
                    "Error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Something went wrong"
                });
            }


            // User not found
            if (results.length === 0) {

                return res.status(404).json({
                    message:
                        "User not found"
                });
            }


            try {

                const user = results[0];


                // Compare password
                const isPasswordMatch =
                    await bcrypt.compare(
                        password,
                        user.password
                    );


                // Password incorrect
                if (!isPasswordMatch) {

                    return res.status(401).json({
                        message:
                            "User not authorized"
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


                return res.status(200).json({
                    message:
                        "Login successful",
                    token: token
                });


            } catch (error) {

                console.log(
                    "Login error:",
                    error
                );

                return res.status(500).json({
                    message:
                        "Something went wrong"
                });
            }
        }
    );
});


// ==================== EXPENSE PAGE ====================

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
        const userId =
            req.user.userId;


        // Validate fields
        if (
            !amount ||
            !description ||
            !category
        ) {

            return res.status(400).json({
                message:
                    "All fields are required"
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

app.get(
    "/api/expenses",
    authenticate,
    (req, res) => {

        const userId =
            req.user.userId;


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


                return res.status(200).json(
                    results
                );
            }
        );
    }
);


// ==================== DELETE EXPENSE ====================

app.delete(
    "/api/expenses/:id",
    authenticate,
    (req, res) => {

        const expenseId =
            req.params.id;

        const userId =
            req.user.userId;


        const deleteExpenseSql = `
            DELETE FROM expenses
            WHERE id = ?
            AND user_id = ?
        `;


        db.query(
            deleteExpenseSql,
            [
                expenseId,
                userId
            ],
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


                if (
                    result.affectedRows === 0
                ) {

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

app.post(
    "/api/premium/create-order",
    authenticate,
    async (req, res) => {

        try {
            const userId = req.user.userId;
            const orderId = "order_" + Date.now();
            const amount = 1.00;

            const insertOrderSql = `
                INSERT INTO orders
                (order_id, user_id, amount, status)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                insertOrderSql,
                [orderId, userId, amount, "PENDING"],
                async (err) => {

                    if (err) {
                        console.log("Database order error:", err);

                        return res.status(500).json({
                            message: "Could not create order"
                        });
                    }

                    const request = {
                        order_amount: amount,
                        order_currency: "INR",
                        order_id: orderId,

                        customer_details: {
                            customer_id: String(userId),
                            customer_phone: "7992219187"
                        },
                            order_meta: {
                            return_url:
                            "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}"
                        }
                        };

                    try {
                        const response =
                            await cashfree.PGCreateOrder(request);

                        return res.status(200).json({
                            message: "Order created successfully",
                            orderId: orderId,
                            paymentSessionId:
                                response.data.payment_session_id
                        });

                    } catch (error) {

                        console.log(
                            "Cashfree order error:",
                            error.response?.data || error.message
                        );

                        return res.status(500).json({
                            message: "Cashfree order creation failed"
                        });
                    }
                }
            );

        } catch (error) {

            console.log(
                "Create order error:",
                error
            );

            return res.status(500).json({
                message: "Something went wrong"
            });
        }
    }
);

// ==================== VERIFY PREMIUM PAYMENT ====================

app.get(
    "/api/premium/verify-payment/:orderId",
    authenticate,
    async (req, res) => {

        try {

            const orderId = req.params.orderId;
            const userId = req.user.userId;

            // Check payment status from Cashfree
            const response =
                await cashfree.PGOrderFetchPayments(orderId);

            const payments = response.data;

            // Check if any payment is successful
            const successfulPayment = payments.find(
                (payment) =>
                    payment.payment_status === "SUCCESS"
            );


            // ==================== PAYMENT SUCCESS ====================

            if (successfulPayment) {

                // Update order status
                const updateOrderSql = `
                    UPDATE orders
                    SET status = 'SUCCESSFUL'
                    WHERE order_id = ?
                    AND user_id = ?
                `;

                db.query(
                    updateOrderSql,
                    [orderId, userId],
                    (err) => {

                        if (err) {

                            console.log(
                                "Order update error:",
                                err
                            );

                            return res.status(500).json({
                                message:
                                    "Could not update order"
                            });
                        }


                        // Make current user premium
                        const updateUserSql = `
                            UPDATE users
                            SET is_premium = 1
                            WHERE id = ?
                        `;

                        db.query(
                            updateUserSql,
                            [userId],
                            (err) => {

                                if (err) {

                                    console.log(
                                        "User premium update error:",
                                        err
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Could not make user premium"
                                    });
                                }


                                return res.status(200).json({
                                    success: true,
                                    message:
                                        "Transaction successful"
                                });
                            }
                        );
                    }
                );


            // ==================== PAYMENT FAILED ====================

            } else {

                const failedOrderSql = `
                    UPDATE orders
                    SET status = 'FAILED'
                    WHERE order_id = ?
                    AND user_id = ?
                `;

                db.query(
                    failedOrderSql,
                    [orderId, userId],
                    (err) => {

                        if (err) {

                            console.log(
                                "Failed order update error:",
                                err
                            );
                        }


                        return res.status(400).json({
                            success: false,
                            message:
                                "TRANSACTION FAILED"
                        });
                    }
                );
            }


        } catch (error) {

            console.log(
                "Payment verification error:",
                error.response?.data || error.message
            );

            return res.status(500).json({
                message:
                    "Payment verification failed"
            });
        }
    }
);

// ==================== CHECK PREMIUM STATUS ====================

app.get(
    "/api/user/premium-status",
    authenticate,
    (req, res) => {

        const userId = req.user.userId;

        const getUserSql = `
            SELECT is_premium
            FROM users
            WHERE id = ?
        `;

        db.query(
            getUserSql,
            [userId],
            (err, results) => {

                if (err) {
                    console.log(
                        "Error checking premium status:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Could not check premium status"
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }

                return res.status(200).json({
                    isPremium:
                        results[0].is_premium === 1
                });
            }
        );
    }
);


// ==================== PREMIUM LEADERBOARD ====================

app.get(
    "/api/premium/leaderboard",
    authenticate,
    (req, res) => {

        const userId = req.user.userId;

        const leaderboardSql = `
            SELECT
                users.name,
                SUM(expenses.amount) AS totalExpenses
            FROM users
            INNER JOIN expenses
                ON users.id = expenses.user_id
            WHERE EXISTS (
                SELECT 1
                FROM users
                WHERE id = ?
                AND is_premium = 1
            )
            GROUP BY users.id, users.name
            ORDER BY totalExpenses DESC
        `;

        db.query(
            leaderboardSql,
            [userId],
            (err, leaderboard) => {

                if (err) {
                    console.log("Leaderboard error:", err);

                    return res.status(500).json({
                        message: "Could not load leaderboard"
                    });
                }

                if (leaderboard.length === 0) {
                    return res.status(403).json({
                        message:
                            "Only premium users can access the leaderboard"
                    });
                }

                return res.status(200).json(leaderboard);
            }
        );
    }
);

// ==================== START SERVER ====================

app.listen(3000, () => {

    console.log(
        "Server is running on port 3000"
    );

});