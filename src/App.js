import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Upcoming from './pages/Upcoming';
import Ongoing from './pages/Ongoing';
import History from './pages/History';
import Maintenance from './pages/Maintenance';
import Trend from './pages/Trend';
import User from './pages/User';
import Booking from './pages/Booking';
import Form from './pages/Form';
import Cancel from './pages/Cancel';
import Availability from './pages/Availability';
import FormAd from './pages/FormAd';
import Room from './pages/Room';
import Automode from './pages/Automode';
import Logs from './pages/Logs';

function App() {
    const [user, setUser] = useState(null);

    // Login logic here
    const handleLogin = (userData) => {
        setUser(userData);
    };

    return (
        <Router>
            <div className="App">
                <Navbar user={user} />
                <Routes>
                    <Route path="/" element={<Login onLogin={handleLogin} />} />
                    <Route path="/Admin" element={<Admin />} />
                    <Route path="/Dashboard" element={<Dashboard />} />
                    <Route path="/Upcoming" element={<Upcoming />} />
                    <Route path="/Ongoing" element={<Ongoing />} />
                    <Route path="/Maintenance" element={<Maintenance />} />
                    <Route path="/Trend" element={<Trend />} />
                    <Route path="/User" element={<User />} />
                    <Route path="/Booking" element={<Booking />} />
                    <Route path="/Form" element={<Form />} />
                    <Route path="/Cancel" element={<Cancel />} />
                    <Route path="/Availability" element={<Availability />} />
                    <Route path="/FormAd" element={<FormAd />} />
                    <Route path="/Room" element={<Room />} />
                    <Route path="/Automode" element={<Automode />} />
                    <Route path="/Logs" element={<Logs />} />
                    <Route path="/History" element={<History />} />
                    
                </Routes>
            </div>
        </Router>
    );
}

export default App;