import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { FaUsers, FaDoorOpen, FaCalendarAlt, FaClipboardList } from 'react-icons/fa';
import { FaCheckCircle, FaBookmark } from 'react-icons/fa';
import moment from 'moment';
import axios from 'axios';

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(moment().startOf('week'));
  const [view, setView] = useState('week');
  const [stats, setStats] = useState({
    activeRooms: 0,
    newBookings: 0,
    totalConferenceRooms: 12, 
    numberOfUsers: 500,
    ongoingBookings: 0,
    finishedBookings: 0
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, bookingsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard-stats'),
        axios.get('http://localhost:5000/api/bookings')
      ]);
      
      setStats({
        ...stats,
        activeRooms: statsResponse.data.activeRooms,
        newBookings: statsResponse.data.newBookings,
        ongoingBookings: statsResponse.data.ongoingBookings,
        finishedBookings: statsResponse.data.finishedBookings
      });
      
      setBookings(bookingsResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error fetching dashboard data. Please try again later.');
      setLoading(false);
    }
  };

  const handleDateChange = (offset) => {
    setCurrentDate(currentDate.clone().add(offset, view));
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const startDate = currentDate.clone().startOf('week');
  const endDate = currentDate.clone().endOf('week');
  const dateRange = `${startDate.format('MMMM D, YYYY')} - ${endDate.format('MMMM D, YYYY')}`;

  const renderTimeline = () => {
    const timeSlots = [...Array(14)].map((_, i) => moment().startOf('day').add(6 + i, 'hours'));
    const rooms = [...new Set(bookings.map(booking => booking.room))];

    return (
      <div className="timeline-grid">
        {rooms.map(room => (
          <div key={room} className="timeline-row">
            <div className="room-label">{room}</div>
            {timeSlots.map((slot, index) => {
              const bookingsForSlot = bookings.filter(booking => 
                booking.status === 'accepted' &&
                moment(booking.startDate).isSameOrBefore(slot) &&
                moment(booking.endDate).isAfter(slot) &&
                booking.room === room
              );
              return (
                <div 
                  key={index} 
                  className={`timeline-cell ${bookingsForSlot.length > 0 ? 'booked' : ''}`}
                  title={bookingsForSlot.length > 0 ? bookingsForSlot[0].subject : ''}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard">
      <div className="stats-container">
        <div className="stat-box">
          <FaCheckCircle className="icon" />
          <div className="stat-value">{stats.activeRooms}</div>
          <div className="stat-label">Active Rooms</div>
        </div>
        <div className="stat-box">
          <FaBookmark className="icon new-bookings" />
          <div className="stat-value">{stats.newBookings}</div>
          <div className="stat-label">New Bookings</div>
        </div>
        <div className="stat-box">
          <FaDoorOpen className="icon" />
          <div className="stat-value">{stats.totalConferenceRooms}</div>
          <div className="stat-label">Total Conf Rooms</div>
        </div>
        <div className="stat-box">
          <FaUsers className="icon" />
          <div className="stat-value">{stats.numberOfUsers}</div>
          <div className="stat-label">Number Of Users</div>
        </div>
        <div className="stat-box">
          <FaClipboardList className="icon ongoing-bookings" />
          <div className="stat-value">{stats.ongoingBookings}</div>
          <div className="stat-label">Ongoing Bookings</div>
        </div>
        <div className="stat-box">
          <FaCheckCircle className="icon" />
          <div className="stat-value">{stats.finishedBookings}</div>
          <div className="stat-label">Finished Bookings</div>
        </div>
      </div>
      <div className="timeline-container">
        <div className="timeline-header">
          <span>Booking Schedule In Timeline</span>
          <div className="timeline-controls">
            <button
              className={view === 'week' ? 'active' : ''}
              onClick={() => handleViewChange('week')}
            >
              Week
            </button>
            <button
              className={view === 'day' ? 'active' : ''}
              onClick={() => handleViewChange('day')}
            >
              Day
            </button>
            <span className="date-range">{dateRange}</span>
            <button onClick={() => handleDateChange(-1)}>&#60;</button>
            <button onClick={() => handleDateChange(1)}>&#62;</button>
            <button onClick={() => setCurrentDate(moment())}>Today</button>
            <button className="calendar-btn">
              <FaCalendarAlt />
            </button>
          </div>
        </div>
        <div className="timeline-content">
          <div className="timeline-labels">
            {[...Array(14)].map((_, i) => (
              <div key={i}>{`${i + 6}:00`}</div>
            ))}
          </div>
          {renderTimeline()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;