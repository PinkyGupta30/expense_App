// ==================== GLOBAL VARIABLES ====================

window.token =
    localStorage.getItem("token");


window.allExpenses =
    [];


let currentPage =
    1;


// Get saved page size from localStorage
// Default is 10

let expensesPerPage =
    Number(
        localStorage.getItem(
            "expensesPerPage"
        )
    ) || 10;


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


const pageSizeSelect =
    document.getElementById(
        "pageSize"
    );


// ==================== SET SAVED PAGE SIZE ====================

if (pageSizeSelect) {

    pageSizeSelect.value =
        expensesPerPage;


    pageSizeSelect.addEventListener(
        "change",
        () => {

            expensesPerPage =
                Number(
                    pageSizeSelect.value
                );


            // Save user's preference

            localStorage.setItem(
                "expensesPerPage",
                expensesPerPage
            );


            // Go back to first page

            currentPage =
                1;


            loadExpenses(
                currentPage
            );
        }
    );
}


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
                                amount:
                                    amount,

                                description:
                                    description,

                                category:
                                    category
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


                // Go to first page after adding

                currentPage =
                    1;


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
                "Error adding expense:",
                error
            );
        }
    }
);


// ==================== LOAD EXPENSES ====================

async function loadExpenses(
    page = currentPage
) {

    try {

        currentPage =
            page;


        const response =
            await fetch(
                `/api/expenses?page=${currentPage}&limit=${expensesPerPage}`,
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


        const lastPage =
            data.lastPage;


        // Edge case:
        // If current page no longer exists
        // after deleting an expense

        if (
            expenses.length === 0 &&
            currentPage > 1 &&
            lastPage < currentPage
        ) {

            currentPage =
                lastPage;


            loadExpenses(
                currentPage
            );


            return;
        }


        // Store currently loaded expenses

        window.allExpenses =
            expenses;


        // Get table body

        const expenseList =
            document.getElementById(
                "expenseList"
            );


        expenseList.innerHTML =
            "";


        // ==================== DISPLAY EXPENSES ====================

        if (
            expenses.length === 0
        ) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td
                    colspan="4"
                    style="text-align: center;"
                >
                    No expenses found
                </td>
            `;


            expenseList.appendChild(
                row
            );

        } else {

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
        }


        // ==================== SHOW PAGINATION ====================

        showPagination(
            data.currentPage,
            lastPage
        );


        // ==================== REFRESH REPORT ====================

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


// ==================== SHOW PAGINATION ====================

function showPagination(
    currentPageNumber,
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

    if (
        lastPage <= 1
    ) {

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
        currentPageNumber === 1;


    previousButton.addEventListener(
        "click",
        () => {

            if (
                currentPageNumber > 1
            ) {

                loadExpenses(
                    currentPageNumber - 1
                );
            }
        }
    );


    pagination.appendChild(
        previousButton
    );


    // ==================== PAGE NUMBER BUTTONS ====================

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


        // Highlight current page

        if (
            page === currentPageNumber
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
        currentPageNumber === lastPage;


    nextButton.addEventListener(
        "click",
        () => {

            if (
                currentPageNumber < lastPage
            ) {

                loadExpenses(
                    currentPageNumber + 1
                );
            }
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
                    method:
                        "DELETE",

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


window.showPagination =
    showPagination;


// ==================== INITIAL PAGE LOAD ====================

window.addEventListener(
    "load",
    () => {

        loadExpenses(
            currentPage
        );


        checkPremiumStatus();
    }
);