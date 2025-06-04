import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Styles.css";
import { useNavigate } from "react-router-dom";

const TransactionsPage = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [editTransactionId, setEditTransactionId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        type: "",
        amount: "",
        category: "",
        description: "",
        date: "",
        accountName: "", // Account name field
    });
    const [filters, setFilters] = useState({
        type: "",
        category: "",
        date: "",
        search: "",
    });

    useEffect(() => {
        fetchTransactions();
        fetchAccounts();
    }, []);

    const fetchTransactions = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;
        if (!token) return;

        try {
            const res = await axios.get("http://localhost:8080/api/transactions", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTransactions(res.data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
        }
    };

    const fetchAccounts = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;
        if (!token) return;

        try {
            const res = await axios.get("http://localhost:8080/api/accounts", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAccounts(res.data);
        } catch (err) {
            console.error("Error fetching accounts:", err);
        }
    };

    const handleEditClick = (transaction) => {
        setEditTransactionId(transaction.id);
        setEditFormData({
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description,
            date: transaction.date,
            accountId: transaction.accountId || "",
        });
    };


    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleSaveEdit = async (id) => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;
        if (!token) return;

        try {
            await axios.put(
                `http://localhost:8080/api/transactions/${id}`,
                editFormData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert("Transaction updated!");
            setEditTransactionId(null);
            fetchTransactions();
        } catch (err) {
            console.error("Error updating transaction:", err);
            alert("Update failed!");
        }
    };

    const handleCancelEdit = () => {
        setEditTransactionId(null);
    };

    const handleDeleteTransaction = async (id) => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;
        if (!token) return;

        if (!window.confirm("Are you sure you want to delete this transaction?")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Transaction deleted!");
            fetchTransactions();
        } catch (err) {
            console.error("Error deleting transaction:", err);
            alert("Delete failed!");
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleResetFilters = () => {
        setFilters({ type: "", category: "", date: "", search: "" });
    };

    const filteredTransactions = transactions.filter((t) => {
        const matchesType = filters.type ? t.type === filters.type : true;
        const matchesCategory = filters.category
            ? t.category.toLowerCase().includes(filters.category.toLowerCase())
            : true;
        const matchesDate = filters.date ? t.date === filters.date : true;
        const matchesSearch = filters.search
            ? t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            t.category.toLowerCase().includes(filters.search.toLowerCase())
            : true;
        return matchesType && matchesCategory && matchesDate && matchesSearch;
    });

    return (
        <div className="transactions-page">
            <h1>My Transactions</h1>

            <div className="filters-container">
                <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="filter-select"
                >
                    <option value="">All Types</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                </select>

                <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="filter-select"
                >
                    <option value="">All Categories</option>
                    <option value="Salary">Salary</option>
                    <option value="Rent">Rent</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Gift">Gift</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Goals">Goals</option>
                    <option value="Other Income">Other Income</option>
                    <option value="Other Expense">Other Expense</option>
                </select>


                <input
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="filter-input"
                />

                <input
                    type="text"
                    name="search"
                    value={filters.search}
                    placeholder="Search"
                    onChange={handleFilterChange}
                    className="filter-input"
                />

                <button className="filter-btn apply-btn" onClick={fetchTransactions}>
                    Apply
                </button>
                <button className="filter-btn reset-btn" onClick={handleResetFilters}>
                    Reset
                </button>

                <button
                    className="add-transaction-btn"
                    onClick={() => navigate("/add-transaction")}
                >
                    + Add Transaction
                </button>
            </div>

            <div className="table-container">
                <table className="transactions-table">
                    <thead>
                    <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Account</th>
                        <th>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredTransactions.map((t) => (
                        editTransactionId === t.id ? (
                            <tr key={t.id} className="edit-row">
                                <td className="edit-cell">
                                    <select name="type" value={editFormData.type} onChange={handleEditChange}>
                                        <option value="INCOME">Income</option>
                                        <option value="EXPENSE">Expense</option>
                                    </select>
                                </td>
                                <td className="edit-cell">
                                    <input
                                        type="number"
                                        name="amount"
                                        value={editFormData.amount}
                                        onChange={handleEditChange}
                                    />
                                </td>
                                <td className="edit-cell">
                                    <select
                                        name="category"
                                        value={editFormData.category}
                                        onChange={handleEditChange}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Salary">Salary</option>
                                        <option value="Rent">Rent</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Gift">Gift</option>
                                        <option value="Groceries">Groceries</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Goals">Goals</option>
                                        <option value="Other   Income">Other Income</option>
                                        <option value="Other Expense">Other Expense</option>
                                    </select>
                                </td>
                                <td className="edit-cell">
                                    <input
                                        type="text"
                                        name="description"
                                        value={editFormData.description}
                                        onChange={handleEditChange}
                                    />
                                </td>
                                <td className="edit-cell">
                                    <input
                                        type="date"
                                        name="date"
                                        value={editFormData.date}
                                        onChange={handleEditChange}
                                    />
                                </td>
                                <td className="edit-cell">
                                    <select
                                        name="accountId"
                                        value={editFormData.accountId}
                                        onChange={handleEditChange}
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.map((a) => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="edit-cell edit-actions">
                                    <button className="save-btn" onClick={() => handleSaveEdit(t.id)}>Save</button>
                                    <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                                </td>
                            </tr>
                        ) : (
                            <tr key={t.id}>
                                <td>{t.type}</td>
                                <td>${t.amount}</td>
                                <td>{t.category}</td>
                                <td>{t.description}</td>
                                <td>{t.date}</td>
                                <td>{t.accountName || "-"}</td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => handleEditClick(t)}>Edit</button>
                                    <button className="action-btn delete-btn" onClick={() => handleDeleteTransaction(t.id)}>Delete</button>
                                </td>
                            </tr>
                        )
                    ))}
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default TransactionsPage;
