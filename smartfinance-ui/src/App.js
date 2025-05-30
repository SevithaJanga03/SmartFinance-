import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AddTransactionPage from './pages/AddTransactionPage';
import AppLayout from './pages/AppLayout';

const App = () => {
    const token = localStorage.getItem('token');

    return (
        <Router>
            <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Layout Routes */}
                {token ? (
                    <Route path="/" element={<AppLayout />}>
                        <Route index element={<Navigate to="/dashboard" />} />
                        <Route path="dashboard" element={<UserDashboard />} />
                        <Route path="add-transaction" element={<AddTransactionPage />} />
                        {/* Add future routes here (transactions, accounts, reports, etc.) */}
                    </Route>
                ) : (
                    // Redirect all protected pages to login
                    <Route path="*" element={<Navigate to="/login" />} />
                )}

                {/* Catch-all: if logged in, redirect to dashboard; else, login */}
                {!token && (
                    <Route path="/" element={<Navigate to="/login" />} />
                )}
                <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
            </Routes>
        </Router>
    );
};

export default App;
