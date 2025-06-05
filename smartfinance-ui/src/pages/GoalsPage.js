import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Goals.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const GoalsPage = () => {
    const [goalSummaries, setGoalSummaries] = useState([]);
    const [newGoal, setNewGoal] = useState({
        name: "",
        targetAmount: "",
        targetDate: "",
    });

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    const fetchGoalSummaries = async () => {
        if (!token) return;
        try {
            const res = await axios.get("http://localhost:8080/api/goals/summary", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoalSummaries(res.data);
        } catch (err) {
            console.error("Error fetching goal summaries:", err);
        }
    };

    const createGoal = async () => {
        if (!newGoal.name.trim() || !newGoal.targetAmount || !newGoal.targetDate) {
            alert("Please fill out all fields before creating a goal.");
            return;
        }

        try {
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
            fetchGoalSummaries();
        } catch (err) {
            console.error("Error creating goal:", err);
            alert("Create failed!");
        }
    };

    const deleteGoal = async (goalId) => {
        try {
            const res = await axios.delete(
                `http://localhost:8080/api/goals/${goalId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const message = res.data;
            if (message.includes("Cannot delete goal")) {
                alert(message);
            } else {
                alert("Goal deleted!");
                fetchGoalSummaries();
            }
        } catch (err) {
            if (err.response && err.response.status === 403) {
                alert("You cannot delete this goal because it has linked transactions.");
            } else {
                console.error("Error deleting goal:", err);
                alert("Delete failed!");
            }
        }
    };

    useEffect(() => {
        fetchGoalSummaries();
    }, []);

    return (
        <div className="goals-container">
            <h1>Your Financial Goals</h1>

            {/* Create New Goal Form */}
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

            {/* Goal Cards */}
            <div className="goal-list">
                {goalSummaries.map((goal) => {
                    const progress = Math.min(
                        (goal.usedAmount / goal.targetAmount) * 100,
                        100
                    );

                    return (
                        <div key={goal.goalId} className="goal-card">
                            <div className="goal-details">
                                <h3>{goal.goalName}</h3>
                                <p>Target Amount: ${goal.targetAmount}</p>
                                <p>Progress: ${goal.usedAmount}</p>
                                <p>Remaining: ${goal.leftAmount}</p>
                                <button
                                    onClick={() => deleteGoal(goal.goalId)}
                                    className="delete-btn"
                                >
                                    Delete
                                </button>
                            </div>

                            <div className="circular-progress-container">
                                <CircularProgressbar
                                    value={progress}
                                    text={`${progress.toFixed(0)}%`}
                                    styles={buildStyles({
                                        pathTransition: "stroke-dashoffset 1.5s ease 0s",
                                        textColor: "#0ea5e9",
                                        pathColor: "#0ea5e9",
                                        trailColor: "#334155",
                                        pathTransitionDuration: 0.5,
                                        // Thicker path:
                                        strokeLinecap: "butt",
                                    })}
                                    strokeWidth={10} // Thicker progress bar
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
