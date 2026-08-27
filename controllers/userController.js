const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const User = require("../models/users");

const ForgotPasswordRequests = require("../models/forgotPasswordRequests");

// ==================== SIGNUP ====================

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    return res.redirect("/signup-success");
  } catch (error) {
    console.log("Signup error:", error);

    return res.status(500).json({
      message: "Signup failed",
    });
  }
};

// ==================== LOGIN ====================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET || "secretkey",
    );

    return res.status(200).json({
      message: "User logged in successfully",
      token: token,
    });
  } catch (error) {
    console.log("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

// ==================== FORGOT PASSWORD ====================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const id = uuidv4();

    await ForgotPasswordRequests.create({
      id: id,
      isActive: true,
      UserId: user.id,
    });

    const resetUrl = `http://localhost:3000/password/resetpassword/${id}`;

    console.log("Reset Password URL:", resetUrl);

    return res.status(200).json({
      message: "Password reset request created successfully",
      resetUrl: resetUrl,
    });
  } catch (error) {
    console.log("Forgot password error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ==================== GET RESET PASSWORD ====================

exports.getResetPassword = async (req, res) => {
  try {
    const id = req.params.id;

    const forgotPasswordRequest = await ForgotPasswordRequests.findOne({
      where: {
        id: id,
        isActive: true,
      },
    });

    if (!forgotPasswordRequest) {
      return res
        .status(404)
        .send("Password reset link is invalid or has expired");
    }

    return res.sendFile(path.join(__dirname, "../public/resetPassword.html"));
  } catch (error) {
    console.log("Get reset password error:", error);

    return res.status(500).send("Something went wrong");
  }
};

// ==================== UPDATE PASSWORD ====================

exports.updatePassword = async (req, res) => {
  try {
    const id = req.params.id;

    const { password } = req.body;

    const forgotPasswordRequest = await ForgotPasswordRequests.findOne({
      where: {
        id: id,
        isActive: true,
      },
    });

    if (!forgotPasswordRequest) {
      return res.status(404).json({
        message: "Password reset link is invalid or expired",
      });
    }

    const user = await User.findByPk(forgotPasswordRequest.UserId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save();

    forgotPasswordRequest.isActive = false;

    await forgotPasswordRequest.save();

    return res.status(200).json({
      message: "Password updated successfully. Please login.",
    });
  } catch (error) {
    console.log("Update password error:", error);

    return res.status(500).json({
      message: "Could not update password",
    });
  }
};
