import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Goals.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const GoalsPage = () => {
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState({
        name: "",
        targetAmount: "",
        targetDate: "",
    });

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    const fetchGoals = async () => {
        const res = await axios.get("http://localhost:8080/api/goals", {
            headers: { Authorization: `Bearer ${token}` },
        });
        setGoals(res.data);
    };

    const createGoal = async () => {
        if (!newGoal.name.trim() || !newGoal.targetAmount || !newGoal.targetDate) {
            alert("Please fill out all fields before creating a goal.");
            return;
        }

        await axios.post(
            "http://localhost:8080/api/goals",
            {
                name: newGoal.name,
                targetAmount: parseFloat(newGoal.targetAmount),
                targetDate: newGoal.targetDate,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setNewGoal({ name: "", targetAmount: "", targetDate: "" });
        fetchGoals();
    };

    const updateGoal = async (id, updatedAmount) => {
        if (!updatedAmount || parseFloat(updatedAmount) <= 0) return;
        await axios.put(
            `http://localhost:8080/api/goals/${id}`,
            { currentAmount: parseFloat(updatedAmount) },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchGoals();
    };

    const deleteGoal = async (id) => {
        await axios.delete(`http://localhost:8080/api/goals/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchGoals();
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    return (
        <div className="goals-container">
            <h1>Your Financial Goals</h1>

            <div className="goal-form">
                <input
                    type="text"
                    placeholder="Goal Name"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Target Amount"
                    value={newGoal.targetAmount}
                    onChange={(e) =>
                        setNewGoal({ ...newGoal, targetAmount: e.target.value })
                    }
                />
                <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) =>
                        setNewGoal({ ...newGoal, targetDate: e.target.value })
                    }
                />
                <button onClick={createGoal}>Create Goal</button>
            </div>

            <div className="goal-list">
                {goals.map((goal) => {
                    const progress = Math.min(
                        (goal.currentAmount / goal.targetAmount) * 100,
                        100
                    );

                    return (
                        <div key={goal.id} className="goal-card">
                            <div className="goal-details">
                                <h3>{goal.name}</h3>
                                <p>Target: ${goal.targetAmount}</p>
                                <p>Current: ${goal.currentAmount}</p>
                                <p>Target Date: {goal.targetDate}</p>
                                <div className="update-container">
                                    <button
                                        onClick={() => deleteGoal(goal.id)}
                                        className="delete-btn"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="circular-progress-container">
                                <CircularProgressbar
                                    value={progress}
                                    text={`${progress.toFixed(0)}%`}
                                    styles={buildStyles({
                                        pathTransition: "stroke-dashoffset 1.5s ease 0s",
                                        textColor: "#22d3ee",
                                        pathColor: "#22d3ee",
                                        trailColor: "#334155",
                                    })}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GoalsPage;
