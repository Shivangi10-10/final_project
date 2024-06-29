import React, { useState, useEffect } from 'react';
import './Admin.css';
import { FaSignOutAlt,FaCogs,FaHome, FaEdit ,FaChartLine, FaCalendarAlt, FaClipboardList, FaHistory, FaBookOpen, FaTools, FaUserCircle, FaExclamationTriangle,FaFileAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Admin = () => {
  const [stats, setStats] = useState({
    activeRooms: 0,
    pendingProposals: 0,
    maintenanceRequests: 0,
    totalBookings: 0
  });

  const [recentProposals, setRecentProposals] = useState([]);
  const [maintenanceRooms, setMaintenanceRooms] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentProposals();
    fetchMaintenanceRooms();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchRecentProposals = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pending-bookings');
      setRecentProposals(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent proposals:', error);
    }
  };

  const fetchMaintenanceRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/maintenance-rooms');
      setMaintenanceRooms(response.data);
    } catch (error) {
      console.error('Error fetching maintenance rooms:', error);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
      <Link to="/Admin">
          <FaHome color="white" size={24} />
      </Link>
        <nav>
          <ul>
            <li><FaCalendarAlt /><Link to="/upcoming">Room Proposals</Link></li>
            <li><FaHistory /><Link to="/history">History</Link></li>
            <li><FaBookOpen /><Link to="/FormAd">Make Bookings</Link></li>
            <li><FaClipboardList /><Link to="/availability">View Availability</Link></li>
            <li><FaChartLine /><Link to="/trend">Trends</Link></li>
            <li><FaTools /><Link to="/maintenance">Maintenance</Link></li>
            <li><FaCogs /><Link to="/automode">Auto mode </Link></li>
            <li><FaEdit /><Link to="/room">Edit rooms </Link></li>
            <li><FaFileAlt /><Link to="/logs">Logs </Link></li>
            <li><FaSignOutAlt /><Link to="/">Logout </Link></li>
          </ul>
        </nav>
      </div>
      <div className="admin-main-content">
        <h1>Admin Dashboard</h1>
        <div className="admin-dashboard-grid">
          <div className="admin-dashboard-item">
            <h2>Important Links</h2>
            <div className="admin-stat-grid">
              <Link to="/upcoming" className="admin-stat-item">
                <FaCalendarAlt className="admin-stat-icon" />
                <span className="admin-stat-label">Active Rooms</span>
              </Link>
              <Link to="/upcoming" className="admin-stat-item">
                <FaClipboardList className="admin-stat-icon" />
                <span className="admin-stat-label">Pending Proposals</span>
              </Link>
              <Link to="/maintenance" className="admin-stat-item">
                <FaExclamationTriangle className="admin-stat-icon" />
                <span className="admin-stat-label">Rooms Under Maintenance</span>
              </Link>
              <Link to="/history" className="admin-stat-item">
                <FaBookOpen className="admin-stat-icon" />
                <span className="admin-stat-label">Total Bookings</span>
              </Link>
            </div>
          </div>
          <div className="admin-dashboard-item">
            <h2>Recent Proposals</h2>
            <ul className="admin-proposal-list">
              {recentProposals.map((proposal, index) => (
                <li key={index}>
                  <FaUserCircle className="admin-proposal-icon" />
                  <span className="admin-proposal-room">Room {proposal.room}</span>
                  <span className="admin-proposal-date">{new Date(proposal.startDate).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="admin-dashboard-item">
            <h2>Quick Actions</h2>
            <div className="admin-action-buttons">
              <Link to="/upcoming" className="admin-action-button">Review Proposals</Link>
              <Link to="/maintenance" className="admin-action-button">Manage Maintenance</Link>
              <Link to="/Form" className="admin-action-button">Create Booking</Link>
            </div>
          </div>
        </div>
      </div>
      <div class="copyright">
     <p>&copy; Shivangi Suyash. All rights reserved.</p>
    </div>
    </div>
  );
};

export default Admin;