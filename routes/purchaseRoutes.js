const express = require("express");

const purchaseController =
    require("../controllers/purchaseController");

const authenticate =
    require("../middleware/auth");

const router = express.Router();


// ==================== PURCHASE ROUTES ====================

// Create premium order
router.post(
    "/create-order",
    authenticate,
    purchaseController.createOrder
);


// Verify premium payment
router.get(
    "/verify-payment/:orderId",
    authenticate,
    purchaseController.verifyPayment
);


module.exports = router;