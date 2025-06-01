import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Budgets.css";

const BudgetsPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [budgetSummary, setBudgetSummary] = useState({
        totalBudget: 0,
        totalUsed: 0,
        totalLeft: 0,
    });
    const [showModal, setShowModal] = useState(false);
    const [newBudget, setNewBudget] = useState({
        category: "",
        budgetLimit: "",
        startDate: "",
        endDate: "",
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editBudget, setEditBudget] = useState(null);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    useEffect(() => {
        fetchBudgets();
        fetchBudgetSummary();
    }, []);

    const fetchBudgets = async () => {
        if (!token) return;
        try {
            const res = await axios.get("http://localhost:8080/api/budgets/with-expenses", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBudgets(res.data);
        } catch (err) {
            console.error("Error fetching budgets:", err);
        }
    };

    const fetchBudgetSummary = async () => {
        if (!token) return;
        try {
            const res = await axios.get("http://localhost:8080/api/budgets/summary", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBudgetSummary(res.data);
        } catch (err) {
            console.error("Error fetching budget summary:", err);
        }
    };

    const handleAddBudget = async () => {
        if (!newBudget.category || !newBudget.budgetLimit) {
            alert("Please fill out the category and limit fields.");
            return;
        }
        try {
            await axios.post("http://localhost:8080/api/budgets", newBudget, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Budget added!");
            setNewBudget({
                category: "",
                budgetLimit: "",
                startDate: "",
                endDate: "",
            });
            setShowModal(false);
            fetchBudgets();
            fetchBudgetSummary();
        } catch (err) {
            console.error("Error adding budget:", err);
            alert("Add failed!");
        }
    };

    const handleEditBudget = (budget) => {
        setEditBudget({ ...budget });
        setShowEditModal(true);
    };

    const handleSaveEditBudget = async () => {
        if (!editBudget.category || !editBudget.budgetLimit) {
            alert("Please fill out the category and limit fields.");
            return;
        }
        try {
            await axios.put(`http://localhost:8080/api/budgets/${editBudget.id}`, editBudget, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Budget updated!");
            setShowEditModal(false);
            fetchBudgets();
            fetchBudgetSummary();
        } catch (err) {
            console.error("Error updating budget:", err);
            alert("Update failed!");
        }
    };

    const handleDeleteBudget = async (budgetId) => {
        if (!window.confirm("Are you sure you want to delete this budget?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/budgets/${budgetId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Budget deleted!");
            fetchBudgets();
            fetchBudgetSummary();
        } catch (err) {
            console.error("Error deleting budget:", err);
            alert("Delete failed!");
        }
    };

    return (
        <div className="budgets-container">
            <h1>Budgets</h1>
            <div className="summary-cards">
                <div className="card">
                    <p>Total Budget</p>
                    <h3>$ {budgetSummary.totalBudget}</h3>
                </div>
                <div className="card">
                    <p>Total Used</p>
                    <h3>$ {budgetSummary.totalUsed}</h3>
                </div>
                <div className="card balance-card">
                    <p>Total Left</p>
                    <h3>$ {budgetSummary.totalLeft}</h3>
                </div>
            </div>

            <button className="add-budget-btn" onClick={() => setShowModal(true)}>
                Add Budget
            </button>

            <div className="table-container">
                <table className="budgets-table">
                    <thead>
                    <tr>
                        <th>Category</th>
                        <th>Budget Limit</th>
                        <th>Used</th>
                        <th>Balance Left</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {budgets.map((budget) => {
                        const percentUsed =
                            budget.budgetLimit > 0 ? (budget.used / budget.budgetLimit) * 100 : 0;
                        return (
                            <tr key={budget.id}>
                                <td>{budget.category}</td>
                                <td>$ {budget.budgetLimit}</td>
                                <td style={{ width: "30%" }}>
                                    <div
                                        style={{
                                            backgroundColor: "#e0e0df",
                                            borderRadius: "10px",
                                            height: "20px",
                                            width: "100%",
                                            position: "relative",
                                        }}
                                    >
                                        <div
                                            style={{
                                                backgroundColor: budget.budgetLimit - (budget.used || 0) >= 0 ? "#76c7c0" : "red",
                                                width: `${
                                                    Math.min(100, (budget.used / budget.budgetLimit) * 100)
                                                }%`,
                                                height: "100%",
                                                borderRadius: "10px",
                                                transition: "width 0.5s",
                                            }}
                                        >
      <span
          style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              fontSize: "0.8rem",
          }}
      >
        ${budget.used}
      </span>
                                        </div>
                                    </div>
                                </td>

                                <td
                                    className={
                                        budget.budgetLimit - (budget.used || 0) >= 0 ? "green" : "red"
                                    }
                                >
                                    $ {budget.budgetLimit - (budget.used || 0)}
                                </td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEditBudget(budget)}>
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteBudget(budget.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {/* Create Budget Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Add New Budget</h3>
                        <select
                            name="category"
                            value={newBudget.category}
                            onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            <option value="Rent">Rent</option>
                            <option value="Food">Food</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Transport">Transport</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Other Expense">Other Expense</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Budget Limit"
                            name="budgetLimit"
                            value={newBudget.budgetLimit}
                            onChange={(e) => setNewBudget({ ...newBudget, budgetLimit: e.target.value })}
                        />
                        <input
                            type="date"
                            name="startDate"
                            value={newBudget.startDate}
                            onChange={(e) => setNewBudget({ ...newBudget, startDate: e.target.value })}
                        />
                        <input
                            type="date"
                            name="endDate"
                            value={newBudget.endDate}
                            onChange={(e) => setNewBudget({ ...newBudget, endDate: e.target.value })}
                        />
                        <div className="modal-buttons">
                            <button className="save-btn" onClick={handleAddBudget}>
                                Save
                            </button>
                            <button className="cancel-btn" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Budget Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Edit Budget</h3>
                        <select
                            name="category"
                            value={editBudget.category}
                            onChange={(e) =>
                                setEditBudget({ ...editBudget, category: e.target.value })
                            }
                        >
                            <option value="">Select Category</option>
                            <option value="Rent">Rent</option>
                            <option value="Food">Food</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Transport">Transport</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Other Expense">Other Expense</option>
                        </select>

                        <input
                            type="number"
                            placeholder="Budget Limit"
                            name="budgetLimit"
                            value={editBudget.budgetLimit}
                            onChange={(e) =>
                                setEditBudget({
                                    ...editBudget,
                                    budgetLimit: e.target.value,
                                })
                            }
                        />
                        <input
                            type="date"
                            name="startDate"
                            value={editBudget.startDate}
                            onChange={(e) =>
                                setEditBudget({
                                    ...editBudget,
                                    startDate: e.target.value,
                                })
                            }
                        />
                        <input
                            type="date"
                            name="endDate"
                            value={editBudget.endDate}
                            onChange={(e) =>
                                setEditBudget({
                                    ...editBudget,
                                    endDate: e.target.value,
                                })
                            }
                        />
                        <div className="modal-buttons">
                            <button className="save-btn" onClick={handleSaveEditBudget}>
                                Save
                            </button>
                            <button
                                className="cancel-btn"
                                onClick={() => setShowEditModal(false)}
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

export default BudgetsPage;
