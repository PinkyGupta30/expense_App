require("dotenv").config();

const express = require("express");

const sequelize =
    require("./config/database");

const User =
    require("./models/users");

const Expense =
    require("./models/expense");

const Order =
    require("./models/orders");


// ==================== MODEL ASSOCIATIONS ====================

// User -> Expenses
User.hasMany(Expense);

Expense.belongsTo(User);


// User -> Orders
User.hasMany(Order);

Order.belongsTo(User);


// ==================== ROUTES ====================

const userRoutes =
    require("./routes/userRoutes");

const expenseRoutes =
    require("./routes/expenseRoutes");

const purchaseRoutes =
    require("./routes/purchaseRoutes");

const premiumRoutes =
    require("./routes/premiumRoutes");


const app = express();


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
        __dirname + "/public/login.html"
    );
});

app.get("/login", (req, res) => {
    res.sendFile(
        __dirname + "/public/login.html"
    );
});

app.get("/forgotpassword", (req, res) => {
    res.sendFile(
        __dirname + "/public/forgotPassword.html"
    );
});


// Signup page
app.get("/signup", (req, res) => {
    res.sendFile(
        __dirname + "/public/signup.html"
    );
});


// Signup success page
app.get("/signup-success", (req, res) => {
    res.sendFile(
        __dirname + "/public/signup-success.html"
    );
});


// Expense dashboard
app.get("/expense", (req, res) => {
    res.sendFile(
        __dirname + "/public/expense.html"
    );
});


// ==================== API ROUTES ====================

app.use(
    "/api/user",
    userRoutes
);

app.use(
    "/password",
    userRoutes
);

app.use(
    "/api/expenses",
    expenseRoutes
);

app.use(
    "/api/premium",
    purchaseRoutes
);

app.use(
    "/api/premium",
    premiumRoutes
);


// ==================== OLD PREMIUM STATUS ROUTE ====================

const authenticate =
    require("./middleware/auth");

const premiumController =
    require("./controllers/premiumController");

app.get(
    "/api/user/premium-status",
    authenticate,
    premiumController.getPremiumStatus
);


// ==================== DATABASE + SERVER ====================

sequelize
    .authenticate()

    .then(() => {

        console.log(
            "Connected to MySQL database!"
        );

        return sequelize.sync();
    })

    .then(() => {

        app.listen(
            3000,
            () => {

                console.log(
                    "Server is running on port 3000"
                );
            }
        );
    })

    .catch((error) => {

        console.log(
            "Unable to connect to database:",
            error
        );
    });