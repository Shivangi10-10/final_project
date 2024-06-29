import React, { useState, useEffect } from 'react';
import axios from 'axios';
import emailjs from 'emailjs-com';
import './Upcoming.css';

const Upcoming = () => {
  const [adminBookings, setAdminBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemarkBox, setShowRemarkBox] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [remark, setRemark] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const [adminResponse, userResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/admin-bookings'),
        axios.get('http://localhost:5000/api/bookings')
      ]);
      setAdminBookings(adminResponse.data);
      setUserBookings(userResponse.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching bookings. Please try again later.');
      setLoading(false);
    }
  };

  const handleAccept = async (id, isAdmin) => {
    try {
      const booking = isAdmin ? adminBookings.find(b => b._id === id) : userBookings.find(b => b._id === id);
      await axios.put(`http://localhost:5000/api/bookings/${id}/accept`);
      sendAcceptanceEmail(booking.email, booking.room, 'accepted');
      updateBookingStatus(id, 'accepted', isAdmin);
    } catch (err) {
      setError('Error accepting booking. Please try again.');
    }
  };

  const handleReject = (id) => {
    setCurrentBookingId(id);
    setShowRemarkBox(true);
  };

  const submitRemark = async () => {
    const trimmedRemark = remark.trim();
    if (trimmedRemark.length < 20 || trimmedRemark.length > 250) {
      setError('Remark must be between 20 and 250 characters.');
      return;
    }
    if (/^[^a-zA-Z0-9]/.test(trimmedRemark)) {
      setError('Remark cannot start with special characters or spaces.');
      return;
    }
    if (/^\s*$/.test(trimmedRemark)) {
      setError('Remark cannot contain only spaces.');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/bookings/${currentBookingId}/reject`, { remark: trimmedRemark });
      const booking = userBookings.find(b => b._id === currentBookingId);
      sendRejectionEmail(booking.email, booking.room, 'rejected', trimmedRemark);
      updateBookingStatus(currentBookingId, 'rejected', false);
      setShowRemarkBox(false);
      setRemark("");
    } catch (err) {
      setError('Error rejecting booking. Please try again.');
    }
  };

  const sendAcceptanceEmail = (emails, room, status) => {
    const templateParams = {
      to_email: emails.join(','), 
      to_name: emails.map(email => email.split('@')[0]).join(', '),
      room: room,
      status: status,
      time: `${new Date().toLocaleString()}`,
    };

    emailjs.send('service_kq4fexk', 'template_89ow825', templateParams, 'vcNtyMqcMa4I1OXkL')
      .then(response => {
        console.log('SUCCESS!', response.status, response.text);
      }, error => {
        console.log('FAILED...', error);
      });
  };

  const sendRejectionEmail = (emails, room, status, remark) => {
    const templateParams = {
      to_email: emails.join(','), 
      to_name: emails.map(email => email.split('@')[0]).join(', '),
      room: room,
      status: status,
      time: `${new Date().toLocaleString()}`,
      remark: remark
    };

    emailjs.send('service_kq4fexk', 'template_89ow825', templateParams, 'vcNtyMqcMa4I1OXkL')
      .then(response => {
        console.log('SUCCESS!', response.status, response.text);
      }, error => {
        console.log('FAILED...', error);
      });
  };

  const updateBookingStatus = (id, status, isAdmin) => {
    const updateBookings = (bookings) =>
      bookings.map(booking => (booking._id === id ? { ...booking, status } : booking));

    if (isAdmin) {
      setAdminBookings(updateBookings(adminBookings));
    } else {
      setUserBookings(updateBookings(userBookings));
    }
  };

  const renderBookingRow = (booking, isAdmin) => {
    const isAccepted = booking.status === 'accepted';
    const isRejected = booking.status === 'rejected';

    return (
      <tr key={booking._id}>
        <td>{booking.room}</td>
        <td>{booking.name}</td>
        <td>{booking.subject}</td>
        <td>{booking.email.join(', ')}</td>
        <td>{new Date(booking.startDate).toLocaleString()}</td>
        <td>{new Date(booking.endDate).toLocaleString()}</td>
        <td>{booking.status}</td>
        {!isAdmin && (
          <td>
            <button
              onClick={() => handleAccept(booking._id, isAdmin)}
              className={`accept ${isAccepted ? 'disabled' : ''}`}
              disabled={isAccepted}
            >
              ✔
            </button>
            <button
              onClick={() => handleReject(booking._id)}
              className={`reject ${isRejected ? 'disabled' : ''}`}
              disabled={isRejected}
            >
              ✘
            </button>
          </td>
        )}
      </tr>
    );
  };

  const filteredBookings = (bookings) => {
    return bookings.filter(booking => 
      (filterStatus === "all" || booking.status === filterStatus) &&
      (booking.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
       booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       booking.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
       booking.email.some(email => email.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="upcoming-container">
      <h1>Upcoming Bookings</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <h2>Admin Bookings</h2>
      <table className="booking-table">
        <thead>
          <tr>
            <th>Room</th>
            <th>Name</th>
            <th>Subject</th>
            <th>Email</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings(adminBookings).map(booking => renderBookingRow(booking, true))}
        </tbody>
      </table>

      <h2>User Bookings</h2>
      <table className="booking-table">
        <thead>
          <tr>
            <th>Room</th>
            <th>Name</th>
            <th>Subject</th>
            <th>Email</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings(userBookings).map(booking => renderBookingRow(booking, false))}
        </tbody>
      </table>

      {showRemarkBox && (
        <div className="remark-overlay">
          <div className="remark-box">
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter remark (20-250 characters)"
            ></textarea>
            <div className="remark-actions">
              <button onClick={submitRemark}>Submit Remark</button>
              <button onClick={() => setShowRemarkBox(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
       <div class="copyright">
     <p>&copy; Shivangi Suyash. All rights reserved.</p>
    </div>
    </div>
  );
};

export default Upcoming;
