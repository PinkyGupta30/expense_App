// ==================== REPORT BUTTONS ====================

const reportButtons =
    document.querySelectorAll(
        ".report-btn"
    );


reportButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const period =
                    button.dataset.period;


                reportButtons.forEach(
                    (btn) => {

                        btn.classList.remove(
                            "active-report-btn"
                        );
                    }
                );


                button.classList.add(
                    "active-report-btn"
                );


                generateReport(
                    period
                );
            }
        );
    }
);


// ==================== GET SELECTED PERIOD ====================

function getSelectedPeriod() {

    const activeButton =
        document.querySelector(
            ".active-report-btn"
        );


    if (activeButton) {

        return activeButton.dataset.period;
    }


    return "daily";
}


// ==================== GET ALL EXPENSES ====================

async function getAllExpenses() {

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

            return [];
        }


        const data =
            await response.json();


        // Get pagination details

        const lastPage =
            data.lastPage;


        let allExpenses =
            [...data.expenses];


        // Fetch remaining pages

        for (
            let page = 2;
            page <= lastPage;
            page++
        ) {

            const pageResponse =
                await fetch(
                    `/api/expenses?page=${page}`,
                    {
                        headers: {
                            "Authorization":
                                `Bearer ${window.token}`
                        }
                    }
                );


            const pageData =
                await pageResponse.json();


            allExpenses =
                allExpenses.concat(
                    pageData.expenses
                );
        }


        return allExpenses;

    } catch (error) {

        console.log(
            "Error getting all expenses:",
            error
        );

        return [];
    }
}


// ==================== GENERATE REPORT ====================

async function generateReport(
    period
) {

    const reportList =
        document.getElementById(
            "reportList"
        );


    reportList.innerHTML =
        "";


    // Fetch all expenses

    const allExpenses =
        await getAllExpenses();


    let totalExpense =
        0;


    let totalIncome =
        0;


    allExpenses.forEach(
        (expense) => {

            totalExpense +=
                Number(
                    expense.amount
                );
        }
    );


    const savings =
        totalIncome -
        totalExpense;


    // Update summary cards

    document
        .getElementById(
            "totalExpense"
        )
        .textContent =
            "₹" + totalExpense;


    document
        .getElementById(
            "totalIncome"
        )
        .textContent =
            "₹" + totalIncome;


    document
        .getElementById(
            "totalSavings"
        )
        .textContent =
            "₹" + savings;


    // Create report row

    const row =
        document.createElement(
            "tr"
        );


    row.innerHTML = `

        <td>
            ${period.toUpperCase()}
        </td>

        <td>
            ₹${totalIncome}
        </td>

        <td>
            ₹${totalExpense}
        </td>

        <td>
            ₹${savings}
        </td>
    `;


    reportList.appendChild(
        row
    );
}


// ==================== MAKE FUNCTIONS GLOBAL ====================

window.generateReport =
    generateReport;


window.getSelectedPeriod =
    getSelectedPeriod;


// ==================== DOWNLOAD EXPENSES ====================

document
    .getElementById(
        "downloadBtn"
    )
    .addEventListener(
        "click",
        async () => {

            // Get all expenses, not only
            // the currently displayed page

            const allExpenses =
                await getAllExpenses();


            if (
                allExpenses.length === 0
            ) {

                alert(
                    "No expenses available to download"
                );

                return;
            }


            let fileContent =
                "Amount,Description,Category\n";


            allExpenses.forEach(
                (expense) => {

                    fileContent +=
                        `${expense.amount},` +
                        `"${expense.description}",` +
                        `${expense.category}\n`;
                }
            );


            const blob =
                new Blob(
                    [fileContent],
                    {
                        type:
                            "text/csv"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                "expenses.csv";


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            URL.revokeObjectURL(
                url
            );
        }
    );