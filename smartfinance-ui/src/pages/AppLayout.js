import React from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import logo from "../logo.svg";
import "../styles/Styles.css";

const AppLayout = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <nav className="nav-links">
                    <NavLink to="/dashboard" className="sidebar-link">Dashboard</NavLink>
                    <NavLink to="/transactions" className="sidebar-link">Transactions</NavLink>
                    <NavLink to="/accounts" className="sidebar-link">Accounts</NavLink>
                    <NavLink to="/budgets" className="sidebar-link">Budgets</NavLink>
                    <NavLink to="/goals" className="sidebar-link">Goals</NavLink>
                    <NavLink to="/debts" className="sidebar-link">Debts</NavLink>
                    <NavLink to="/reports" className="sidebar-link">Reports</NavLink>
                    <NavLink to="/add-transaction" className="sidebar-link add-button-link">+ Add</NavLink>
                </nav>
            </aside>

            {/* Top navbar */}
            <div className="main-content">
                <header className="navbar">
                    <div className="navbar-left">
                        <img src={logo} alt="SmartFinance Logo" className="navbar-logo" />
                        <span className="navbar-title">SmartFinance</span>
                    </div>
                    <div className="navbar-right">
                        {user && <span className="navbar-user">Hi, {user.name}</span>}
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                </header>

                <main className="dashboard-container">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
