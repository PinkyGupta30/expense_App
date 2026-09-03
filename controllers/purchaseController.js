const { v4: uuidv4 } = require("uuid");

const Order = require("../models/orders");
const User = require("../models/users");

const cashfree = require("../services/cashfreeService");

const logger = require("../utils/logger");

// ==================== CREATE PREMIUM ORDER ====================

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.userId;

        const amount = process.env.PREMIUM_AMOUNT;

        const orderId = "order_" + uuidv4();

        await Order.create({
            orderId: orderId,
            status: "PENDING",
            UserId: userId
        });

        const request = {
            order_amount: amount,

            order_currency: "INR",

            order_id: orderId,

            customer_details: {
                customer_id: String(userId),
                customer_phone: process.env.CUSTOMER_PHONE
            },

            order_meta: {
                return_url: process.env.CASHFREE_RETURN_URL
            }
        };

        const response =
            await cashfree.PGCreateOrder(request);

        await Order.update(
            {
                paymentSessionId:
                    response.data.payment_session_id
            },
            {
                where: {
                    orderId: orderId,
                    UserId: userId
                }
            }
        );

        return res.status(200).json({
            message: "Order created successfully",
            orderId: orderId,
            paymentSessionId:
                response.data.payment_session_id
        });

    } catch (error) {

        logger.error({
            message: "Cashfree order error",
            error: error.response?.data || error.message,
            stack: error.stack
        });

        return res.status(500).json({
            message: "Cashfree order creation failed"
        });
    }
};

// ==================== VERIFY PREMIUM PAYMENT ====================

exports.verifyPayment = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const userId = req.user.userId;

        const response =
            await cashfree.PGOrderFetchPayments(orderId);

        const payments = response.data;

        const successfulPayment =
            payments.find(
                (payment) =>
                    payment.payment_status === "SUCCESS"
            );

        if (successfulPayment) {

            await Order.update(
                {
                    status: "SUCCESSFUL"
                },
                {
                    where: {
                        orderId: orderId,
                        UserId: userId
                    }
                }
            );

            await User.update(
                {
                    isPremium: true
                },
                {
                    where: {
                        id: userId
                    }
                }
            );

            return res.status(200).json({
                success: true,
                message: "Transaction successful"
            });
        }

        await Order.update(
            {
                status: "FAILED"
            },
            {
                where: {
                    orderId: orderId,
                    UserId: userId
                }
            }
        );

        return res.status(400).json({
            success: false,
            message: "TRANSACTION FAILED"
        });

    } catch (error) {

        logger.error({
            message: "Payment verification error",
            error: error.response?.data || error.message,
            stack: error.stack
        });

        return res.status(500).json({
            message: "Payment verification failed"
        });
    }
};