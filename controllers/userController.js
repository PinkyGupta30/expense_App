const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/users");


// ==================== SIGNUP ====================

exports.signup = async (req, res) => {

    try {

        const { name, email, password } = req.body;


        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                email: email
            }
        });


        if (existingUser) {

            return res.status(409).json({
                message: "User already exists"
            });
        }


        // Encrypt password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // Create new user
        await User.create({
            name: name,
            email: email,
            password: hashedPassword
        });


       return res.redirect("/signup-success");


    } catch (error) {

        console.log("Signup error:", error);

        return res.status(500).json({
            message: "Signup failed"
        });
    }
};



// ==================== LOGIN ====================

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;


        // Find user by email
        const user = await User.findOne({
            where: {
                email: email
            }
        });


        if (!user) {

            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        // Compare password
        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isPasswordCorrect) {

            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_SECRET || "secretkey"
        );


        return res.status(200).json({
            message: "User logged in successfully",
            token: token
        });


    } catch (error) {

        console.log("Login error:", error);

        return res.status(500).json({
            message: "Login failed"
        });
    }
};