import React, { useState } from 'react';
import { FaHome, FaClipboardList, FaHistory, FaBookOpen, FaChartLine, FaTimes, FaUser, FaBars, FaCalendarAlt, FaTools, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ role }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const userLinks = (
        <ul>
            <li><FaBookOpen /><Link to="/form">Make Bookings</Link></li>
            <li><FaTimes /><Link to="/cancel">Cancel Booking</Link></li>
            <li><FaClipboardList /><Link to="/availability">View Availability</Link></li>
            <li><FaHistory /><Link to="/history">History</Link></li>
            <li><FaChartLine /><Link to="/trend">Trends</Link></li>
        </ul>
    );

    const adminLinks = (
        <ul>
            <li><FaCalendarAlt /><Link to="/upcoming">Room Proposals</Link></li>
            <li><FaHistory /><Link to="/history">History</Link></li>
            <li><FaBookOpen /><Link to="/FormAd">Make Bookings</Link></li>
            <li><FaClipboardList /><Link to="/availability">View Availability</Link></li>
            <li><FaChartLine /><Link to="/trend">Trends</Link></li>
            <li><FaTools /><Link to="/maintenance">Maintenance</Link></li>
            <li><FaEdit /><Link to="/automode">Auto mode</Link></li>
            <li><FaEdit /><Link to="/room">Edit rooms</Link></li>
        </ul>
    );

    return (
        <div className="sidebar-container">
            <div className="hamburger-icon" onClick={toggleSidebar}>
                <FaBars />
            </div>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="user-view">
                    <FaUser className="user-icon" />
                    <Link to={role === 'admin' ? "/Admin" : "/User"}>
                        <FaHome color="white" size={24} />
                    </Link>
                </div>
                <nav>
                    {role === 'admin' ? adminLinks : userLinks}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;
