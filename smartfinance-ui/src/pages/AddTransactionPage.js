import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Styles.css";

const AddTransactionPage = () => {
    const [type, setType] = useState("INCOME");
    const [accounts, setAccounts] = useState([]);
    const [formData, setFormData] = useState({
        amount: "",
        category: "",
        description: "",
        date: "",
        accountId: "" // ➡️ New field for selected account
    });
    const [message, setMessage] = useState("");

    // ➡️ Fetch accounts when the component mounts
    useEffect(() => {
        const fetchAccounts = async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            const token = user?.token;

            if (!token) return;

            try {
                const res = await axios.get("http://localhost:8080/api/accounts", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAccounts(res.data);
            } catch (err) {
                console.error("Error fetching accounts:", err);
            }
        };

        fetchAccounts();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;

        if (!token) {
            setMessage("User not authenticated");
            return;
        }

        if (!formData.accountId) {
            setMessage("Please select an account");
            return;
        }

        try {
            const payload = { ...formData, type };
            await axios.post("http://localhost:8080/api/transactions", payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage("✅ Transaction added successfully!");
            setFormData({
                amount: "",
                category: "",
                description: "",
                date: "",
                accountId: ""
            });
        } catch (err) {
            console.error("Error adding transaction:", err);
            setMessage("❌ Failed to add transaction.");
        }
    };

    const setTypeAndReset = (newType) => {
        setType(newType);
        setFormData((prev) => ({ ...prev, category: "" }));
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
                {/* ➡️ Account select */}
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
                    className="amount-input"
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
