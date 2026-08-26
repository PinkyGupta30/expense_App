const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define("Order", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },

    orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    paymentSessionId: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "PENDING"
    }
},
{
    tableName: "orders",
    timestamps: false
});

module.exports = Order;