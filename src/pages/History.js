import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './History.css';

const History = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        const fetchAllBookings = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/forms');
                setBookings(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching bookings:', err);
                setError('Error fetching booking history. Please try again later.');
                setLoading(false);
            }
        };

        fetchAllBookings();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        return (
            (!filterStatus || booking.status === filterStatus) &&
            (booking.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.email.some(email => email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            booking.subject.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="history-container">
            <h1>Booking History</h1>
            <div className="controls">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="pending">Pending</option>
                </select>
            </div>
            <table className="booking-table">
                <thead>
                    <tr>
                        <th>Room</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.map((booking) => (
                        <tr key={booking._id}>
                            <td>{booking.room}</td>
                            <td>{booking.name}</td>
                            <td>{booking.email.join(', ')}</td>
                            <td>{booking.subject}</td>
                            <td>{new Date(booking.startDate).toLocaleString()}</td>
                            <td>{new Date(booking.endDate).toLocaleString()}</td>
                            <td className={booking.status}>{booking.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div class="copyright">
         <p>&copy; Shivangi Suyash. All rights reserved.</p>
        </div>
        </div>
    );
};

export default History;
