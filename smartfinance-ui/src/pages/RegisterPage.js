// src/pages/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Styles.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'USER',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/users/register', form);
            alert('Registration successful!');
            navigate('/login');
        } catch (err) {
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div className="page-wrapper">
            <div className="form-container">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
                    <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                    <button type="submit">Register</button>
                </form>
                <p className="auth-switch-link">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
