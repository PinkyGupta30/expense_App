// ==================== GLOBAL VARIABLES ====================

window.token =
    localStorage.getItem("token");

window.allExpenses =
    [];


// ==================== CHECK LOGIN ====================

if (!window.token) {

    window.location.href =
        "/login";
}


// ==================== GET HTML ELEMENTS ====================

const expenseForm =
    document.getElementById(
        "expenseForm"
    );

const descriptionInput =
    document.getElementById(
        "description"
    );


// ==================== SUGGEST CATEGORY ====================

descriptionInput.addEventListener(
    "blur",
    async () => {

        const description =
            descriptionInput.value;

        if (!description) {

            return;
        }

        try {

            const response =
                await fetch(
                    "/api/expenses/suggest-category",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${window.token}`
                        },

                        body:
                            JSON.stringify({
                                description:
                                    description
                            })
                    }
                );

            const data =
                await response.json();

            if (response.ok) {

                document
                    .getElementById(
                        "category"
                    )
                    .value =
                        data.category;
            }

        } catch (error) {

            console.log(
                "Error suggesting category:",
                error
            );
        }
    }
);


// ==================== ADD EXPENSE ====================

expenseForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const amount =
            document
                .getElementById(
                    "amount"
                )
                .value;

        const description =
            document
                .getElementById(
                    "description"
                )
                .value;

        const category =
            document
                .getElementById(
                    "category"
                )
                .value;

        try {

            const response =
                await fetch(
                    "/api/expenses",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${window.token}`
                        },

                        body:
                            JSON.stringify({
                                amount: amount,
                                description: description,
                                category: category
                            })
                    }
                );

            const data =
                await response.json();

            if (response.ok) {

                alert(
                    "Expense added successfully"
                );

                expenseForm.reset();

                loadExpenses();

            } else {

                alert(
                    data.message
                );
            }

        } catch (error) {

            console.log(
                "Error adding expense:",
                error
            );
        }
    }
);


// ==================== LOAD EXPENSES ====================

async function loadExpenses() {

    try {

        const response =
            await fetch(
                "/api/expenses",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${window.token}`
                    }
                }
            );

        if (!response.ok) {

            const data =
                await response.json();

            alert(
                data.message
            );

            localStorage.removeItem(
                "token"
            );

            window.location.href =
                "/login";

            return;
        }

        const expenses =
            await response.json();


        // Store expenses globally
        window.allExpenses =
            expenses;


        const expenseList =
            document.getElementById(
                "expenseList"
            );

        expenseList.innerHTML =
            "";


        expenses.forEach(
            (expense) => {

                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `

                    <td>${expense.amount}</td>

                    <td>${expense.description}</td>

                    <td>${expense.category}</td>

                    <td>

                        <button
                            class="delete-btn"
                            onclick="deleteExpense(${expense.id})"
                        >
                            Delete
                        </button>

                    </td>
                `;

                expenseList.appendChild(
                    row
                );
            }
        );


        // Refresh report after expenses load
        if (
            typeof generateReport ===
            "function"
        ) {

            generateReport(
                getSelectedPeriod()
            );
        }

    } catch (error) {

        console.log(
            "Error fetching expenses:",
            error
        );
    }
}


// ==================== DELETE EXPENSE ====================

async function deleteExpense(
    expenseId
) {

    try {

        const response =
            await fetch(
                `/api/expenses/${expenseId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${window.token}`
                    }
                }
            );

        const data =
            await response.json();

        if (response.ok) {

            alert(
                "Expense deleted successfully"
            );

            loadExpenses();

        } else {

            alert(
                data.message
            );
        }

    } catch (error) {

        console.log(
            "Error deleting expense:",
            error
        );
    }
}


// Make functions available globally

window.loadExpenses =
    loadExpenses;

window.deleteExpense =
    deleteExpense;


// ==================== INITIAL PAGE LOAD ====================

window.addEventListener(
    "load",
    () => {

        loadExpenses();

        checkPremiumStatus();
    }
);