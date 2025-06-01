import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AccountCss.css";

const AccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [accountSummary, setAccountSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        totalBalance: 0,
    });
    const [showModal, setShowModal] = useState(false);
    const [newAccount, setNewAccount] = useState({ name: "", type: "" });

    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;

    const [editAccountId, setEditAccountId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        type: "",
        income: "",
        expenses: "",
        balance: "",
    });

    useEffect(() => {
        fetchAccounts();
        fetchAccountSummary();
    }, []);

    const fetchAccounts = async () => {
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

    const fetchAccountSummary = async () => {
        if (!token) return;

        try {
            const res = await axios.get("http://localhost:8080/api/accounts/summary", {
                headers: { Authorization: `Bearer ${token}` },
            });


            // Save the per-account summary
            setAccounts(res.data); // because now this has income, expenses, balance for each account

            // Calculate total income, expenses, balance
            const totalIncome = res.data.reduce((sum, acc) => sum + acc.totalIncome, 0);
            const totalExpenses = res.data.reduce((sum, acc) => sum + acc.totalExpenses, 0);
            const totalBalance = res.data.reduce((sum, acc) => sum + acc.balance, 0);

            setAccountSummary({
                totalIncome,
                totalExpenses,
                totalBalance
            });
        } catch (err) {
            console.error("Error fetching account summary:", err);
        }
    };


    const handleAddAccount = async () => {
        if (!newAccount.name || !newAccount.type) {
            alert("Please fill out all fields");
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/accounts", newAccount, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNewAccount({ name: "", type: "" });
            setShowModal(false);
            fetchAccounts();
            fetchAccountSummary();
        } catch (err) {
            console.error("Error adding account:", err);
        }
    };

    const handleEditClick = (account) => {
        setEditAccountId(account.id);
        setEditFormData({
            name: account.name,
            type: account.type,
            income: account.totalIncome,
            expenses: account.totalExpenses,
            balance: account.balance,
        });
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleSaveEdit = async (accountId) => {
        try {
            await axios.put(`http://localhost:8080/api/accounts/${accountId}`, editFormData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Account updated!");
            setEditAccountId(null);
            fetchAccounts();
            fetchAccountSummary();
        } catch (err) {
            console.error("Error updating account:", err);
            alert("Update failed!");
        }
    };

    const handleCancelEdit = () => {
        setEditAccountId(null);
    };

    const handleDeleteAccount = async (accountId) => {
        if (!window.confirm("Are you sure you want to delete this account?")) return;

        try {
            await axios.delete(`http://localhost:8080/api/accounts/${accountId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Account deleted!");
            fetchAccounts();
            fetchAccountSummary();
        } catch (err) {
            console.error("Error deleting account:", err);
            if (err.response && err.response.status === 409) {  // HTTP 409 = Conflict
                alert("Cannot delete this account because it has transactions linked to it.");
            }else {
                alert("Delete failed!");
            }
        }
    };

    return (
        <div className="accounts-container">
            <h1>Accounts</h1>
            <div className="summary-cards">
                <div className="card">
                    <p>Total Accounts</p>
                    <h3>{accounts.length}</h3>
                </div>
                <div className="card">
                    <p>Total Income</p>
                    <h3>$ {accountSummary.totalIncome}</h3>
                </div>
                <div className="card">
                    <p>Total Expenses</p>
                    <h3>$ {accountSummary.totalExpenses}</h3>
                </div>
                <div className="card balance-card">
                    <p>Total Balance</p>
                    <h3>$ {accountSummary.totalBalance}</h3>
                </div>
            </div>

            <button className="add-account-btn" onClick={() => setShowModal(true)}>
                Add Account
            </button>

            <div className="table-container">
                <table className="accounts-table">
                    <thead>
                    <tr>
                        <th>Account Details</th>
                        <th>Account Type</th>
                        <th>Total Income</th>
                        <th>Total Expenses</th>
                        <th>Current Balance</th>
                        <th>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {accounts.map((acc) => (
                        <tr key={acc.id}>
                            {editAccountId === acc.id ? (
                                <>
                                    <td className="edit-cell">
                                        <input
                                            type="text"
                                            name="name"
                                            value={editFormData.name}
                                            onChange={handleEditChange}
                                        />
                                    </td>
                                    <td className="edit-cell">
                                        <select
                                            name="type"
                                            value={editFormData.type}
                                            onChange={handleEditChange}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Bank">Bank</option>
                                            <option value="Credit Card">Credit Card</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </td>
                                    <td className="edit-cell balance-cell">
                                        $ {editFormData.income}
                                    </td>
                                    <td className="edit-cell balance-cell">
                                        $ {editFormData.expenses}
                                    </td>
                                    <td className="edit-cell balance-cell">
                                        $ {editFormData.balance}
                                    </td>
                                    <td className="edit-cell edit-actions">
                                        <button className="save-btn" onClick={() => handleSaveEdit(acc.id)}>
                                            Save
                                        </button>
                                        <button className="cancel-btn" onClick={handleCancelEdit}>
                                            Cancel
                                        </button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{acc.name}</td>
                                    <td>{acc.type}</td>
                                    {/* 💡 Use totalIncome and totalExpenses here */}
                                    <td className="balance-cell">$ {acc.totalIncome}</td>
                                    <td className="balance-cell">$ {acc.totalExpenses}</td>
                                    <td className="balance-cell">$ {acc.balance}</td>
                                    <td>
                                        <button className="edit-btn" onClick={() => handleEditClick(acc)}>
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteAccount(acc.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                    </tbody>

                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Add New Account</h3>
                        <input
                            type="text"
                            placeholder="Account Name"
                            name="name"
                            value={newAccount.name}
                            onChange={(e) =>
                                setNewAccount({ ...newAccount, name: e.target.value })
                            }
                        />
                        <select
                            name="type"
                            value={newAccount.type}
                            onChange={(e) =>
                                setNewAccount({ ...newAccount, type: e.target.value })
                            }
                        >
                            <option value="">Select Type</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank">Bank</option>
                            <option value="Credit Card">Credit Card</option>
                        </select>
                        <div className="modal-buttons">
                            <button className="save-btn" onClick={handleAddAccount}>
                                Save
                            </button>
                            <button
                                className="cancel-btn"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsPage;
