const { v4: uuidv4 } = require("uuid");

const Order = require("../models/orders");
const User = require("../models/users");

const cashfree = require("../services/cashfreeService");


// ==================== CREATE PREMIUM ORDER ====================

exports.createOrder = async (req, res) => {

    try {

        const userId = req.user.userId;

        const amount = 499;

        const orderId =
            "order_" + uuidv4();


        // Create order in database
        await Order.create({
            orderId: orderId,
            status: "PENDING",
            UserId: userId
        });


        // Cashfree order request
        const request = {

            order_amount: amount,

            order_currency: "INR",

            order_id: orderId,


            customer_details: {

                customer_id: String(userId),

                customer_phone: "7992219187"
            },


            order_meta: {

                return_url:
                    "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}"
            }
        };


        // Create order in Cashfree
        const response =
            await cashfree.PGCreateOrder(
                request
            );


        // Save payment session ID
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

            message:
                "Order created successfully",

            orderId: orderId,

            paymentSessionId:
                response.data.payment_session_id
        });


    } catch (error) {

        console.log(
            "Cashfree order error:",
            error.response?.data ||
            error.message
        );

        return res.status(500).json({

            message:
                "Cashfree order creation failed"
        });
    }
};



// ==================== VERIFY PREMIUM PAYMENT ====================

exports.verifyPayment = async (req, res) => {

    try {

        const orderId =
            req.params.orderId;

        const userId =
            req.user.userId;


        // Check payment from Cashfree
        const response =
            await cashfree.PGOrderFetchPayments(
                orderId
            );


        const payments =
            response.data;


        // Find successful payment
        const successfulPayment =
            payments.find(
                (payment) =>
                    payment.payment_status ===
                    "SUCCESS"
            );


        // ==================== PAYMENT SUCCESS ====================

        if (successfulPayment) {

            // Update order
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


            // Make user premium
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

                message:
                    "Transaction successful"
            });
        }


        // ==================== PAYMENT FAILED ====================

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

            message:
                "TRANSACTION FAILED"
        });


    } catch (error) {

        console.log(
            "Payment verification error:",
            error.response?.data ||
            error.message
        );


        return res.status(500).json({

            message:
                "Payment verification failed"
        });
    }
};