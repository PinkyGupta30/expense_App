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


                // Remove active class

                reportButtons.forEach(
                    (btn) => {

                        btn.classList.remove(
                            "active-report-btn"
                        );
                    }
                );


                // Add active class

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


// ==================== GENERATE REPORT ====================

function generateReport(
    period
) {

    const reportList =
        document.getElementById(
            "reportList"
        );


    reportList.innerHTML =
        "";


    let totalExpense =
        0;


    // Current project contains expenses only

    let totalIncome =
        0;


    window.allExpenses.forEach(
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


// Make functions available globally

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
        () => {

            if (
                window.allExpenses.length === 0
            ) {

                alert(
                    "No expenses available to download"
                );

                return;
            }


            let fileContent =
                "Amount,Description,Category\n";


            window.allExpenses.forEach(
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