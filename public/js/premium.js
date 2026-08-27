// ==================== BUY PREMIUM ====================

document
    .getElementById(
        "premiumBtn"
    )
    .addEventListener(
        "click",
        async () => {

            try {

                const response =
                    await fetch(
                        "/api/premium/create-order",
                        {
                            method: "POST",

                            headers: {
                                "Authorization":
                                    `Bearer ${window.token}`
                            }
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message
                    );

                    return;
                }


                const cashfree =
                    Cashfree({
                        mode: "sandbox"
                    });


                localStorage.setItem(
                    "premiumOrderId",
                    data.orderId
                );


                cashfree.checkout({
                    paymentSessionId:
                        data.paymentSessionId,

                    redirectTarget:
                        "_self"
                });


            } catch (error) {

                console.log(
                    "Premium payment error:",
                    error
                );

                alert(
                    "Something went wrong while starting payment"
                );
            }
        }
    );


// ==================== VERIFY PREMIUM PAYMENT ====================

window.addEventListener(
    "load",
    async () => {

        const orderId =
            localStorage.getItem(
                "premiumOrderId"
            );


        if (!orderId) {

            return;
        }


        localStorage.removeItem(
            "premiumOrderId"
        );


        try {

            const response =
                await fetch(
                    `/api/premium/verify-payment/${orderId}`,
                    {
                        headers: {
                            "Authorization":
                                `Bearer ${window.token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (data.success) {

                alert(
                    "Transaction successful"
                );


                checkPremiumStatus();

            } else {

                alert(
                    "TRANSACTION FAILED"
                );
            }

        } catch (error) {

            console.log(
                "Payment verification error:",
                error
            );
        }
    }
);


// ==================== CHECK PREMIUM STATUS ====================

async function checkPremiumStatus() {

    try {

        const response =
            await fetch(
                "/api/user/premium-status",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${window.token}`
                    }
                }
            );


        const data =
            await response.json();


        const premiumMessage =
            document.getElementById(
                "premiumMessage"
            );

        const premiumBtn =
            document.getElementById(
                "premiumBtn"
            );

        const leaderboardBtn =
            document.getElementById(
                "leaderboardBtn"
            );

        const premiumReport =
            document.getElementById(
                "premiumReport"
            );

        const downloadBtn =
            document.getElementById(
                "downloadBtn"
            );


        if (data.isPremium) {

            premiumMessage.style.display =
                "block";

            premiumBtn.style.display =
                "none";

            leaderboardBtn.style.display =
                "block";

            premiumReport.style.display =
                "block";

            downloadBtn.disabled =
                false;


            // Show default report
            if (
                typeof generateReport ===
                "function"
            ) {

                generateReport(
                    "daily"
                );
            }

        } else {

            premiumMessage.style.display =
                "none";

            premiumBtn.style.display =
                "block";

            leaderboardBtn.style.display =
                "none";

            premiumReport.style.display =
                "none";

            downloadBtn.disabled =
                true;
        }

    } catch (error) {

        console.log(
            "Error checking premium status:",
            error
        );
    }
}


// Make available to expense.js

window.checkPremiumStatus =
    checkPremiumStatus;


// ==================== SHOW LEADERBOARD ====================

document
    .getElementById(
        "leaderboardBtn"
    )
    .addEventListener(
        "click",
        async () => {

            try {

                const response =
                    await fetch(
                        "/api/premium/leaderboard",
                        {
                            headers: {
                                "Authorization":
                                    `Bearer ${window.token}`
                            }
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message
                    );

                    return;
                }


                const leaderboardContainer =
                    document.getElementById(
                        "leaderboardContainer"
                    );


                const leaderboardList =
                    document.getElementById(
                        "leaderboardList"
                    );


                leaderboardList.innerHTML =
                    "";


                data.forEach(
                    (user, index) => {

                        const row =
                            document.createElement(
                                "tr"
                            );


                        row.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${user.name}</td>
                            <td>₹${user.totalExpenses}</td>
                        `;


                        leaderboardList.appendChild(
                            row
                        );
                    }
                );


                leaderboardContainer.style.display =
                    "block";

            } catch (error) {

                console.log(
                    "Leaderboard error:",
                    error
                );
            }
        }
    );