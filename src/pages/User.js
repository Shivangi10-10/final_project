import React, { useState, useEffect } from 'react';
import './User.css';
import { FaHome, FaClipboardList, FaHistory, FaBookOpen, FaChartLine, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const User = () => {
  const [username, setUsername] = useState('');
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [chartData, setChartData] = useState(null);
  const [roomUsageData, setRoomUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.username) {
      setUsername(location.state.username);
    }
    fetchAcceptedBookings();
    fetchBookingStats();
    fetchChartData();
    fetchRoomUsageData();
  }, [location]);

  const fetchAcceptedBookings = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bookings?status=accepted&username=${username}`);
      setAcceptedBookings(response.data);
    } catch (error) {
      console.error('Error fetching accepted bookings:', error);
    }
  };

  const fetchBookingStats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bookings/stats?username=${username}`);
      setBookingStats(response.data);
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bookings/chart?username=${username}`);
      const labels = response.data.map(item => item.date);
      const data = response.data.map(item => item.count);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Bookings',
            data,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const fetchRoomUsageData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/forms');
      const bookings = response.data;

      const roomUsage = bookings.reduce((acc, booking) => {
        acc[booking.room] = (acc[booking.room] || 0) + 1;
        return acc;
      }, {});

      setRoomUsageData({
        labels: Object.keys(roomUsage),
        datasets: [{
          label: 'Room Usage',
          data: Object.values(roomUsage),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ],
          hoverBackgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ]
        }]
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching room usage data:', err);
      setLoading(false);
    }
  };

  return (
    <>
    <div className="user-page">
      <div className="admin-sidebar">
        <div className="user-view">
          <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{username}</span>
            <span className="user-role">Employee</span>
          </div>
        </div>
        <nav>
          <ul>
            <li><Link to="/User"><FaHome /> Dashboard</Link></li>
            <li><Link to="/form"><FaBookOpen /> Make Booking</Link></li>
            <li><Link to="/availability"><FaClipboardList /> View Availability</Link></li>
            <li><Link to="/history"><FaHistory /> Booking History</Link></li>
            <li><Link to="/cancel"><FaTimes /> Cancel Booking</Link></li>
            <li><Link to="/trend"><FaChartLine /> Trends</Link></li>
            <li><Link to="/logout"><FaSignOutAlt /> Logout</Link></li>
          </ul>
        </nav>
      </div>
      <div className="main-content">
        <h1>Welcome, {username}!</h1>
        <div className="dashboard-grid">
          <div className="dashboard-item">
            <h2>Recent Accepted Bookings</h2>
            <ul className="booking-list">
              {acceptedBookings.slice(0, 3).map((booking, index) => (
                <li key={index}>
                  <div className="booking-info">
                    <span className="booking-room">Room: {booking.room}</span>
                    <span className="booking-date">
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="dashboard-item">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/form" className="action-button">New Booking</Link>
              <Link to="/availability" className="action-button secondary-button">Check Availability</Link>
            </div>
          </div>
          <div className="dashboard-item">
            <div className="chart-container">
              {chartData && <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
              {roomUsageData && (
                <div className="pie-chart-container">
                  <h2>Room Usage Distribution</h2>
                  <Pie data={roomUsageData} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
     <div class="copyright">
     <p>&copy; Shivangi Suyash. All rights reserved.</p>
    </div>
    </>
  );
};

export default User;
