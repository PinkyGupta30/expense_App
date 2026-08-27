// ==================== GLOBAL VARIABLES ====================

window.token =
    localStorage.getItem("token");

window.allExpenses =
    [];


// ==================== PAGINATION ====================

let currentPage = 1;


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


                // Load first page
                loadExpenses(1);

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

async function loadExpenses(
    page = 1
) {

    try {

        currentPage =
            page;


        const response =
            await fetch(
                `/api/expenses?page=${page}`,
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


        const data =
            await response.json();


        const expenses =
            data.expenses;


        const expenseList =
            document.getElementById(
                "expenseList"
            );


        expenseList.innerHTML =
            "";


        // Display only expenses returned
        // Backend returns maximum 10 expenses

        expenses.forEach(
            (expense) => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${expense.amount}
                    </td>

                    <td>
                        ${expense.description}
                    </td>

                    <td>
                        ${expense.category}
                    </td>

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


        // ==================== SHOW PAGINATION ====================

        showPagination(
            data.currentPage,
            data.lastPage
        );


        // Refresh report if available
        if (
            typeof generateReport ===
            "function"
            &&
            typeof getSelectedPeriod ===
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


// ==================== SHOW PAGINATION ====================

function showPagination(
    currentPage,
    lastPage
) {

    const pagination =
        document.getElementById(
            "pagination"
        );


    pagination.innerHTML =
        "";


    // If there is only one page,
    // no need to show pagination

    if (lastPage <= 1) {

        return;
    }


    // ==================== PREVIOUS BUTTON ====================

    const previousButton =
        document.createElement(
            "button"
        );


    previousButton.textContent =
        "Previous";


    previousButton.disabled =
        currentPage === 1;


    previousButton.addEventListener(
        "click",
        () => {

            loadExpenses(
                currentPage - 1
            );
        }
    );


    pagination.appendChild(
        previousButton
    );


    // ==================== PAGE NUMBERS ====================

    for (
        let page = 1;
        page <= lastPage;
        page++
    ) {

        const pageButton =
            document.createElement(
                "button"
            );


        pageButton.textContent =
            page;


        if (
            page === currentPage
        ) {

            pageButton.classList.add(
                "active-page"
            );
        }


        pageButton.addEventListener(
            "click",
            () => {

                loadExpenses(
                    page
                );
            }
        );


        pagination.appendChild(
            pageButton
        );
    }


    // ==================== NEXT BUTTON ====================

    const nextButton =
        document.createElement(
            "button"
        );


    nextButton.textContent =
        "Next";


    nextButton.disabled =
        currentPage === lastPage;


    nextButton.addEventListener(
        "click",
        () => {

            loadExpenses(
                currentPage + 1
            );
        }
    );


    pagination.appendChild(
        nextButton
    );
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


            // Reload current page
            loadExpenses(
                currentPage
            );

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


// ==================== MAKE FUNCTIONS GLOBAL ====================

window.loadExpenses =
    loadExpenses;

window.deleteExpense =
    deleteExpense;


// ==================== INITIAL PAGE LOAD ====================

window.addEventListener(
    "load",
    () => {

        loadExpenses(1);


        if (
            typeof checkPremiumStatus ===
            "function"
        ) {

            checkPremiumStatus();
        }
    }
);