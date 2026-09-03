const User = require("../models/users");

const logger = require("../utils/logger");

// ==================== CHECK PREMIUM STATUS ====================

exports.getPremiumStatus = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            isPremium: user.isPremium
        });

    } catch (error) {

        logger.error({
            message: "Premium status error",
            error: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            message: "Could not check premium status"
        });
    }
};

// ==================== PREMIUM LEADERBOARD ====================

exports.getLeaderboard = async (req, res) => {
    try {
        const userId = req.user.userId;

        const currentUser =
            await User.findByPk(userId);

        if (
            !currentUser ||
            !currentUser.isPremium
        ) {
            return res.status(403).json({
                message:
                    "Only premium users can access the leaderboard"
            });
        }

        const leaderboardOfUsers =
            await User.findAll({
                attributes: [
                    "id",
                    "name",
                    "totalExpenses"
                ],
                order: [
                    ["totalExpenses", "DESC"]
                ]
            });

        return res.status(200).json(
            leaderboardOfUsers
        );

    } catch (error) {

        logger.error({
            message: "Leaderboard error",
            error: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            message: "Could not load leaderboard"
        });
    }
};