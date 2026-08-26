const express = require("express");

const premiumController =
    require("../controllers/premiumController");

const authenticate =
    require("../middleware/auth");

const router = express.Router();


// ==================== PREMIUM STATUS ====================

router.get(
    "/status",
    authenticate,
    premiumController.getPremiumStatus
);


// ==================== LEADERBOARD ====================

router.get(
    "/leaderboard",
    authenticate,
    premiumController.getLeaderboard
);


module.exports = router;