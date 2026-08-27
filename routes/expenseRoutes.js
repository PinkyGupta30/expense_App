const express = require("express");

const expenseController =
    require("../controllers/expenseController");

const authenticate =
    require("../middleware/auth");

const router = express.Router();


// ==================== EXPENSE ROUTES ====================

// Add expense
router.post(
    "/",
    authenticate,
    expenseController.addExpense
);


// Get all expenses
router.get(
    "/",
    authenticate,
    expenseController.getExpenses
);

// Suggest expense category using AI

router.post(
    "/suggest-category",
    authenticate,
    expenseController.suggestCategory
);


// Delete expense
router.delete(
    "/:id",
    authenticate,
    expenseController.deleteExpense
);


module.exports = router;