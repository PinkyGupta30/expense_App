const express = require("express");

const userController =
    require("../controllers/userController");

const router = express.Router();


// ==================== USER ROUTES ====================

router.post(
    "/signup",
    userController.signup
);

router.post(
    "/login",
    userController.login
);

router.post(
    "/forgotpassword",
    userController.forgotPassword
);


module.exports = router;