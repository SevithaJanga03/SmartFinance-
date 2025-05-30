// src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Styles.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8080/api/users/login', form);
            const token = res.data.token;
            console.log("Login response:", res.data);

            if (token) {
                localStorage.setItem("user", JSON.stringify({
                    name: res.data.name,
                    email: res.data.email,
                    token: res.data.token
                }));
                alert('Login successful!');
                navigate('/dashboard');
            } else {
                alert('Token not received!');
            }
        } catch (err) {
            alert('Login failed. Please check your credentials.');
            console.error(err);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="form-container">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                    <button type="submit">Login</button>
                </form>
                <p className="auth-switch-link">
                    Don’t have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
