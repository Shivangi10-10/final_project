import React, { useEffect, useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from './assets/iocl.png';
import { FaUserCircle } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { FaHome } from 'react-icons/fa';
import User from '../pages/User';

const Navbar = () => {
    const [username, setUsername] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            // Replace with your actual API call
            const userData = await fetch('/api/user-details');
            const result = await userData.json();
            setUsername(result.username);
        };

        fetchUserData();
    }, []);

   
    const handleLogout = () => {
        setShowUserMenu(false); // Close the user menu
        localStorage.removeItem('token');
        navigate('/'); // Navigate to the home page
    };

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    

    return (
        <div className="navbar">
            <img src={logo} alt="IOCL Logo" className="navbar-logo" />
            <div className="navbar-text">
                <div className="navbar-title">IndianOil</div>
                <div className="navbar-subtitle">The Energy Of India</div>
            </div>
            <div className='heading'><h2>Conference Room Booking System</h2></div>
        </div>
    );
};

export default Navbar;