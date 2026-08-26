const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    totalExpenses: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
},
{
    tableName: "users",
    timestamps: false
});


module.exports = User;