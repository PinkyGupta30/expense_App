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


// Open reset password page
router.get(
    "/resetpassword/:id",
    userController.getResetPassword
);


// Update password
router.post(
    "/updatepassword/:id",
    userController.updatePassword
);

router.get(
    "/resetpassword/:id",
    userController.getResetPassword
);

router.post(
    "/updatepassword/:id",
    userController.updatePassword
);


module.exports = router;