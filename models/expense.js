const { DataTypes } = require("sequelize");

const sequelize =
    require("../config/database");


const Expense =
    sequelize.define(
        "Expense",
        {

            id: {
                type:
                    DataTypes.INTEGER,

                autoIncrement:
                    true,

                allowNull:
                    false,

                primaryKey:
                    true
            },


            amount: {
                type:
                    DataTypes.FLOAT,

                allowNull:
                    false
            },


            description: {
                type:
                    DataTypes.STRING,

                allowNull:
                    false
            },


            category: {
                type:
                    DataTypes.STRING,

                allowNull:
                    false
            },


            // New column added using migration

            note: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            }

        },
        {

            tableName:
                "expenses",

            timestamps:
                false
        }
    );


module.exports =
    Expense;