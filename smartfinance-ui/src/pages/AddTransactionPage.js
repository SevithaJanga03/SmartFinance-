import React, { useState } from "react";
import axios from "axios";
import "../styles/Styles.css";

const AddTransactionPage = () => {
    const [type, setType] = useState("INCOME");
    const [formData, setFormData] = useState({
        amount: "",
        category: "",
        description: "",
        date: ""
    });
    const [message, setMessage] = useState("");

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

        try {
            const payload = { ...formData, type };
            await axios.post("http://localhost:8080/api/transactions", payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage("✅ Transaction added successfully!");
            setFormData({ amount: "", category: "", description: "", date: "" });
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
