import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const UserDashboard = () => {
    const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 });
    const [incomeByCategory, setIncomeByCategory] = useState({});
    const [expensesByCategory, setExpensesByCategory] = useState({});
    const [lastSixMonths, setLastSixMonths] = useState({});

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;

        if (!token) return;

        axios.get("http://localhost:8080/api/users/dashboard", {
            headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
            setSummary(res.data.summary);
            setIncomeByCategory(res.data.incomeByCategory);
            setExpensesByCategory(res.data.expensesByCategory);
            setLastSixMonths(res.data.lastSixMonths);
        }).catch((err) => {
            console.error("Dashboard fetch error:", err);
        });
    }, []);

    const incomePieData = {
        labels: Object.keys(incomeByCategory),
        datasets: [
            {
                data: Object.values(incomeByCategory),
                backgroundColor: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
            },
        ],
    };

    const expensePieData = {
        labels: Object.keys(expensesByCategory),
        datasets: [
            {
                data: Object.values(expensesByCategory),
                backgroundColor: ["#f87171", "#fca5a5", "#fecaca", "#fee2e2"],
            },
        ],
    };

    const barChartData = {
        labels: Object.keys(lastSixMonths),
        datasets: [
            {
                label: "Income",
                data: Object.values(lastSixMonths).map((month) => month.income || 0),
                backgroundColor: "#22c55e",
            },
            {
                label: "Expenses",
                data: Object.values(lastSixMonths).map((month) => month.expense || 0),
                backgroundColor: "#ef4444",
            },
        ],
    };

    return (
        <>
            <h1>Dashboard</h1>

            <div className="dashboard-stats-grid">
                <StatCard label="Total Balance" value={summary.balance} color="blue" />
                <StatCard label="Total Income" value={summary.income} color="green" />
                <StatCard label="Total Expenses" value={summary.expenses} color="red" />
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Income by Category</h3>
                    <Pie data={incomePieData} />
                </div>
                <div className="chart-card">
                    <h3>Expenses by Category</h3>
                    <Pie data={expensePieData} />
                </div>
                <div className="chart-card full-width">
                    <h3>Last 6 Months Overview</h3>
                    <Bar data={barChartData} />
                </div>
            </div>
        </>
    );
};

const StatCard = ({ label, value, color }) => (
    <div className={`stat-card ${color}`}>
        <p className="stat-label">{label}</p>
        <p className="stat-value">${value.toLocaleString()}</p>
    </div>
);

export default UserDashboard;
