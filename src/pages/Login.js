// login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
    const [userCredentials, setUserCredentials] = useState({ username: '', password: '' });
    const [registerCredentials, setRegisterCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        setError('');
    };

    const handleUserLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', userCredentials);
            localStorage.setItem('token', response.data.token);
            navigate('/user', { state: { username: userCredentials.username } });
        } catch (err) {
            setError('Invalid user credentials');
        }
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/admin-login', adminCredentials);
            localStorage.setItem('adminToken', response.data.token);
            navigate('/admin');
        } catch (err) {
            setError('Invalid admin credentials');
        }
    };

    const handleAdminInputChange = (e) => {
        const { name, value } = e.target;
        setAdminCredentials({ ...adminCredentials, [name]: value });
    };

    const handleUserInputChange = (e) => {
        const { name, value } = e.target;
        setUserCredentials({ ...userCredentials, [name]: value });
    };

    const handleRegisterInputChange = (e) => {
        const { name, value } = e.target;
        setRegisterCredentials({ ...registerCredentials, [name]: value });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/register', registerCredentials);
            setIsSigningUp(false);
            setError('');
        } catch (err) {
            setError('Error registering user');
        }
    };

    return (
        <>
        <div className={`login-container ${isFlipped ? 'flipped' : ''}`}>
            <div className="flipper">
                <div className="front">
                    <h2>User Login</h2>
                    <form onSubmit={handleUserLogin}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={userCredentials.username}
                            onChange={handleUserInputChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={userCredentials.password}
                            onChange={handleUserInputChange}
                            required
                        />
                        <button type="submit">Login</button>
                    </form>
                    {!isSigningUp && (
                        <button onClick={() => setIsSigningUp(true)}>Sign Up</button>
                    )}
                    {isSigningUp && (
                        <form onSubmit={handleSignUp}>
                            <input
                                type="text"
                                name="username"
                                placeholder="New Username"
                                value={registerCredentials.username}
                                onChange={handleRegisterInputChange}
                                required
                            />
                            
                            <input
                                type="password"
                                name="password"
                                placeholder="New Password"
                                value={registerCredentials.password}
                                onChange={handleRegisterInputChange}
                                required
                            />
                            <button type="submit">Register</button>
                        </form>
                    )}
                    <button onClick={handleFlip}>Admin Login</button>
                </div>
                <div className="back">
                    <h2>Admin Login</h2>
                    <form onSubmit={handleAdminLogin}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Admin Username"
                            value={adminCredentials.username}
                            onChange={handleAdminInputChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Admin Password"
                            value={adminCredentials.password}
                            onChange={handleAdminInputChange}
                            required
                        />
                        <button type="submit">Login</button>
                    </form>
                    <button onClick={handleFlip}>User Login</button>
                </div>
            </div>
            {error && <p className="error">{error}</p>}
            
        </div>
        <div class="copyright">
         <p>&copy; Shivangi Suyash. All rights reserved.</p>
        </div>
       </>
    );
};

export default Login;