import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/ReportsPage.css"; // Or create a new ReportsPage.css if you prefer

const ReportsPage = () => {
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [monthData, setMonthData] = useState(null);
    const [topExpenses, setTopExpenses] = useState([]);
    const [expenseVsIncome, setExpenseVsIncome] = useState(null);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    useEffect(() => {
        const fetchMonths = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/reports/available-months", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMonths(res.data);
                if (res.data.length > 0) {
                    setSelectedMonth(res.data[0]);
                    fetchMonthData(res.data[0]);
                }
            } catch (err) {
                console.error("Error fetching months:", err);
            }
        };
        fetchMonths();
    }, [token]);

    const fetchMonthData = async (month) => {
        if (!token) return;
        try {
            const res = await axios.get(
                `http://localhost:8080/api/reports/monthly-data?month=${month}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMonthData(res.data);
            setTopExpenses(res.data.topExpenses);
            setExpenseVsIncome(res.data.expenseVsIncome);
        } catch (error) {
            console.error("Error fetching month data:", error);
        }
    };

    const handleDownloadCSV = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/reports/transactions/csv", {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "transactions.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading CSV:", error);
        }
    };

    return (
        <div className="reports-container">
            <h1>Financial Reports</h1>

            <div style={{ marginBottom: "20px" }}>
                <label htmlFor="monthSelector">Select Month:</label>
                <select
                    id="monthSelector"
                    value={selectedMonth}
                    onChange={(e) => {
                        const month = e.target.value;
                        setSelectedMonth(month);
                        fetchMonthData(month);
                    }}
                    style={{ marginLeft: "10px" }}
                >
                    {months.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </select>
            </div>

            <button onClick={handleDownloadCSV} className="download-btn">
                Download All Transactions CSV
            </button>

            {monthData && (
                <>
                    <div className="chart-grid">
                        <div className="chart-card">
                            <h3>Income by Category</h3>
                            <Pie
                                data={{
                                    labels: monthData.incomeByCategory.map((item) => item.category),
                                    datasets: [
                                        {
                                            label: "Income",
                                            data: monthData.incomeByCategory.map((item) => item.amount),
                                            backgroundColor: ["#16c784", "#4ade80"],
                                        },
                                    ],
                                }}
                                options={{
                                    layout: {
                                        padding: {
                                            top: 20,
                                            bottom: 20,
                                        },
                                    },
                                    plugins: {
                                        legend: {
                                            labels: {
                                                padding: 20, // Adds spacing between legend items
                                            },
                                        },
                                    },
                                }}
                            />

                        </div>

                        <div className="chart-card">
                            <h3>Expenses by Category</h3>
                            <Pie
                                data={{
                                    labels: monthData.expensesByCategory.map((item) => item.category),
                                    datasets: [
                                        {
                                            label: "Expenses",
                                            data: monthData.expensesByCategory.map((item) => item.amount),
                                            backgroundColor: ["#ef4444", "#f97316", "#facc15", "#38bdf8"],
                                        },
                                    ],
                                }}
                                options={{
                                    layout: {
                                        padding: {
                                            top: 20,
                                            bottom: 20,
                                        },
                                    },
                                    plugins: {
                                        legend: {
                                            labels: {
                                                padding: 20, // Adds spacing between legend items
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>

                        <div className="chart-card">
                            <h3>Expense vs Income</h3>
                            <Bar
                                data={{
                                    labels: ["Income", "Expenses"],
                                    datasets: [
                                        {
                                            label: "Amount",
                                            data: [monthData.totalIncome, monthData.totalExpenses],
                                            backgroundColor: ["#16c784", "#ef4444"],
                                        },
                                    ],
                                }}
                            />
                        </div>

                        <div className="chart-card">
                            <h3>Top 5 Expense Categories</h3>
                            <Bar
                                data={{
                                    labels: topExpenses.map((e) => e.category),
                                    datasets: [
                                        {
                                            label: "Expenses",
                                            data: topExpenses.map((e) => e.amount),
                                            backgroundColor: "#ef4444",
                                        },
                                    ],
                                }}
                            />
                        </div>

                        <div className="chart-card">
                            <h3>Expense Growth (Last 6 Months)</h3>
                            <Bar
                                data={{
                                    labels: monthData.last6Months.map((m) => m.month),
                                    datasets: [
                                        {
                                            label: "Expenses",
                                            data: monthData.last6Months.map((m) => m.expense),
                                            backgroundColor: "#f97316",
                                        },
                                    ],
                                }}
                            />
                        </div>

                        <div className="chart-card">
                            <h3>Savings Rate Over Time</h3>
                            <Bar
                                data={{
                                    labels: monthData.last6Months.map((m) => m.month),
                                    datasets: [
                                        {
                                            label: "Savings Rate",
                                            data: monthData.last6Months.map((m) =>
                                                m.income ? ((m.income - m.expense) / m.income).toFixed(2) : 0
                                            ),
                                            backgroundColor: "#22d3ee",
                                        },
                                    ],
                                }}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>

    );
};

export default ReportsPage;
