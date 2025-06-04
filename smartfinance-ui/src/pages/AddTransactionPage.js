import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Styles.css";

const AddTransactionPage = () => {
    const [type, setType] = useState("INCOME");
    const [accounts, setAccounts] = useState([]);
    const [goals, setGoals] = useState([]);
    const [message, setMessage] = useState("");
    const [goalError, setGoalError] = useState(""); // Error for no goals

    const [formData, setFormData] = useState({
        amount: "",
        category: "",
        description: "",
        date: "",
        accountId: "",
        goalId: "" // New field to hold selected goal
    });

    const token = JSON.parse(localStorage.getItem("user"))?.token;

    // Fetch accounts
    useEffect(() => {
        if (!token) return;

        const fetchAccounts = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/accounts", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAccounts(res.data);
            } catch (err) {
                console.error("Error fetching accounts:", err);
            }
        };

        fetchAccounts();
    }, [token]);

    // Fetch goals only if category is "Goals"
    useEffect(() => {
        if (formData.category === "Goals") {
            const fetchGoals = async () => {
                try {
                    const res = await axios.get("http://localhost:8080/api/goals", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.length === 0) {
                        setGoalError("❌ No goals found. Please add a goal first.");
                    } else {
                        setGoalError("");
                        setGoals(res.data);
                    }
                } catch (err) {
                    console.error("Error fetching goals:", err);
                }
            };
            fetchGoals();
        } else {
            // Clear goal selection if user changes category
            setFormData((prev) => ({ ...prev, goalId: "" }));
            setGoalError("");
        }
    }, [formData.category, token]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setMessage("User not authenticated");
            return;
        }

        if (!formData.accountId) {
            setMessage("Please select an account");
            return;
        }

        if (formData.category === "Goals" && !formData.goalId) {
            setMessage("Please select a goal for this transaction");
            return;
        }

        try {
            const payload = { ...formData, type };
            await axios.post("http://localhost:8080/api/transactions", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage("✅ Transaction added successfully!");
            setFormData({
                amount: "",
                category: "",
                description: "",
                date: "",
                accountId: "",
                goalId: ""
            });
        } catch (err) {
            console.error("Error adding transaction:", err);
            setMessage("❌ Failed to add transaction.");
        }
    };

    const setTypeAndReset = (newType) => {
        setType(newType);
        setFormData((prev) => ({ ...prev, category: "", goalId: "" }));
    };

    return (
        <div className="transaction-form-container">
            <h2>Add {type === "INCOME" ? "Income" : "Expense"}</h2>

            <div className="transaction-toggle">
                <button
                    className={type === "INCOME" ? "active" : ""}
                    type="button"
                    onClick={() => setTypeAndReset("INCOME")}
                >
                    Income
                </button>
                <button
                    className={type === "EXPENSE" ? "active" : ""}
                    type="button"
                    onClick={() => setTypeAndReset("EXPENSE")}
                >
                    Expense
                </button>
            </div>

            <form onSubmit={handleSubmit} className="transaction-form">
                <select
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Account</option>
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.type})
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    name="amount"
                    placeholder="0"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    onWheel={(e) => e.target.blur()}
                    required
                />

                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Category</option>
                    {type === "INCOME" ? (
                        <>
                            <option value="Salary">Salary</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Investments">Investments</option>
                            <option value="Gift">Gift</option>
                            <option value="Goals">Goals</option>
                            <option value="Other Income">Other Income</option>
                        </>
                    ) : (
                        <>
                            <option value="Rent">Rent</option>
                            <option value="Food">Food</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Transport">Transport</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Other Expense">Other Expense</option>
                        </>
                    )}
                </select>

                {/* Show goal dropdown if category is Goals */}
                {formData.category === "Goals" && (
                    <>
                        {goals.length > 0 ? (
                            <select
                                name="goalId"
                                value={formData.goalId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Goal</option>
                                {goals.map((goal) => (
                                    <option key={goal.id} value={goal.id}>
                                        {goal.name} (Target: ${goal.targetAmount})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="form-message error" style={{ marginTop: "8px" }}>
                                ❌ No goals found. Please add a goal first.
                            </p>
                        )}
                    </>
                )}


                <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                />

                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />

                <button type="submit">Add Transaction</button>
            </form>

            {message && <p className="form-message">{message}</p>}
        </div>
    );
};

export default AddTransactionPage;
