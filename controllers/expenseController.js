const Expense = require("../models/expense");
const User = require("../models/users");
const { GoogleGenAI } = require("@google/genai");
const sequelize = require("../config/database");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ==================== ADD EXPENSE ====================

exports.addExpense = async (req, res) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const { amount, description, category } = req.body;

    const userId = req.user.userId;

    // Create expense
    const expense = await Expense.create(
      {
        amount: amount,
        description: description,
        category: category,
        UserId: userId,
      },
      {
        transaction: transaction,
      },
    );

    // Update user's total expenses
    const user = await User.findByPk(userId);

    user.totalExpenses = Number(user.totalExpenses) + Number(amount);

    await user.save({
      transaction: transaction,
    });
    await transaction.commit();

    return res.status(201).json({
      message: "Expense added successfully",
      expense: expense,
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.log("Add expense error:", error);

    return res.status(500).json({
      message: "Could not add expense",
    });
  }
};

// ==================== GET EXPENSES ====================

exports.getExpenses = async (req, res) => {

    try {

        const page =
            Number(req.query.page) || 1;

        const limit = 10;


        const offset =
            (page - 1) * limit;


        const {
            count,
            rows
        } =
            await Expense.findAndCountAll({

                where: {
                    UserId: req.user.id
                },

                limit: limit,

                offset: offset,

                order: [
                    ["id", "DESC"]
                ]
            });


        const lastPage =
            Math.ceil(
                count / limit
            );


        return res.status(200).json({

            expenses: rows,

            currentPage: page,

            lastPage: lastPage,

            totalExpenses: count
        });

    } catch (error) {

        console.log(
            "Get expenses error:",
            error
        );

        return res.status(500).json({
            message:
                "Could not fetch expenses"
        });
    }
};

// ==================== DELETE EXPENSE ====================

exports.deleteExpense = async (req, res) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const userId = req.user.userId;

    const expenseId = req.params.id;

    // Find expense belonging to logged-in user
    const expense = await Expense.findOne({
      where: {
        id: expenseId,
        UserId: userId,
      },
      transaction: transaction,
    });

    if (!expense) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Expense not found",
      });
    }

    // Update total expenses before deleting
    const user = await User.findByPk(userId);

    user.totalExpenses = Number(user.totalExpenses) - Number(expense.amount);

    await user.save({
      transaction: transaction,
    });
    // Delete expense
    await expense.destroy({
      transaction: transaction,
    });
    await transaction.commit();
    return res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    console.log("Delete expense error:", error);

    return res.status(500).json({
      message: "Could not delete expense",
    });
  }
};

// ==================== SUGGEST CATEGORY ====================

exports.suggestCategory = async (req, res) => {
  try {
    const { description } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",

      contents: `
Classify the following expense into exactly one of these categories:

Food
Petrol
Salary
Shopping
Travel
Other

Expense description: ${description}

Return only the category name. Do not explain anything.
`,
    });

    const category = response.text.trim();

    return res.status(200).json({
      category: category,
    });
  } catch (error) {
    console.log("Category suggestion error:", error);

    return res.status(500).json({
      message: "Could not suggest category",
    });
  }
};
