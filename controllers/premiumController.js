const User = require("../models/users");


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

        console.log(
            "Premium status error:",
            error
        );

        return res.status(500).json({
            message: "Could not check premium status"
        });
    }
};



// ==================== PREMIUM LEADERBOARD ====================

exports.getLeaderboard = async (req, res) => {

    try {

        const userId = req.user.userId;


        // Check whether logged-in user is premium
        const currentUser = await User.findByPk(userId);


        if (
            !currentUser ||
            !currentUser.isPremium
        ) {

            return res.status(403).json({
                message:
                    "Only premium users can access the leaderboard"
            });
        }


        // Get all users ordered by total expenses
        const leaderboardOfUsers = await User.findAll({

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

        console.log(
            "Leaderboard error:",
            error
        );

        return res.status(500).json({
            message: "Could not load leaderboard"
        });
    }
};