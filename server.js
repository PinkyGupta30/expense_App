require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const sequelize = require("./config/database");

const logger = require("./utils/logger");

const User = require("./models/users");
const Expense = require("./models/expense");
const Order = require("./models/orders");
const ForgotPasswordRequests = require("./models/forgotPasswordRequests");

// ==================== MODEL ASSOCIATIONS ====================

// User -> Expenses
User.hasMany(Expense);
Expense.belongsTo(User);

// User -> Forgot Password Requests
User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);

// User -> Orders
User.hasMany(Order);
Order.belongsTo(User);

// ==================== ROUTES ====================

const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const premiumRoutes = require("./routes/premiumRoutes");

// ==================== APP ====================

const app = express();

// ==================== LOG DIRECTORY ====================

const logDirectory = path.join(__dirname, "logs");

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// ==================== MORGAN LOGGING ====================

const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, "access.log"),
    {
        flags: "a"
    }
);

app.use(
    morgan("combined", {
        stream: accessLogStream
    })
);

// ==================== MIDDLEWARE ====================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.static("public"));

// ==================== FRONTEND ROUTES ====================

// Login page
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "login.html")
    );
});

app.get("/login", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "login.html")
    );
});

app.get("/forgotpassword", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "forgotPassword.html")
    );
});

// Signup page
app.get("/signup", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "signup.html")
    );
});

// Signup success page
app.get("/signup-success", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "signup-success.html")
    );
});

// Expense dashboard
app.get("/expense", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "expense.html")
    );
});

// ==================== API ROUTES ====================

app.use("/api/user", userRoutes);

app.use("/password", userRoutes);

app.use("/api/expenses", expenseRoutes);

app.use("/api/premium", purchaseRoutes);

app.use("/api/premium", premiumRoutes);

// ==================== PREMIUM STATUS ====================

const authenticate = require("./middleware/auth");

const premiumController =
    require("./controllers/premiumController");

app.get(
    "/api/user/premium-status",
    authenticate,
    premiumController.getPremiumStatus
);

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {

    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl
    });

    res.status(500).json({
        message: "Something went wrong"
    });
});

// ==================== DATABASE + SERVER ====================

const PORT = process.env.PORT || 3000;

sequelize
    .authenticate()

    .then(() => {

        logger.info(
            "Connected to MySQL database!"
        );

        return sequelize.sync();
    })

    .then(() => {

        app.listen(PORT, () => {

            logger.info(
                `Server is running on port ${PORT}`
            );
        });
    })

    .catch((error) => {

        logger.error({
            message: "Unable to connect to database",
            error: error.message,
            stack: error.stack
        });

    });