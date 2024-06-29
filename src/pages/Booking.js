import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Booking.css';

const Booking = () => {
    const [bookings, setBookings] = useState({ pending: [], accepted: [], rejected: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const [pendingResponse, acceptedResponse, rejectedResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/pending-bookings'),
                    axios.get('http://localhost:5000/api/bookings?status=accepted'),
                    axios.get('http://localhost:5000/api/bookings?status=rejected')
                ]);

                setBookings({
                    pending: pendingResponse.data,
                    accepted: acceptedResponse.data,
                    rejected: rejectedResponse.data
                });
                setLoading(false);
            } catch (err) {
                setError('Error fetching bookings. Please try again later.');
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="booking-container">
            <h1>Booking Requests</h1>
            <div className="booking-list">
                <h2>Pending Bookings</h2>
                {bookings.pending.length > 0 ? (
                    bookings.pending.map((booking) => (
                        <div key={booking._id} className="booking-card">
                            <h3>{booking.room}</h3>
                            <p><strong>Name:</strong> {booking.name}</p>
                            <p><strong>Email:</strong> {booking.email.join(', ')}</p>
                            <p><strong>Start Date:</strong> {new Date(booking.startDate).toLocaleString()}</p>
                            <p><strong>End Date:</strong> {new Date(booking.endDate).toLocaleString()}</p>
                            <p><strong>Status:</strong> {booking.status}</p>
                        </div>
                    ))
                ) : (
                    <p>No pending bookings at this time.</p>
                )}

                <h2>Accepted Bookings</h2>
                {bookings.accepted.length > 0 ? (
                    bookings.accepted.map((booking) => (
                        <div key={booking._id} className="booking-card">
                            <h3>{booking.room}</h3>
                            <p><strong>Name:</strong> {booking.name}</p>
                            <p><strong>Email:</strong> {booking.email.join(', ')}</p>
                            <p><strong>Start Date:</strong> {new Date(booking.startDate).toLocaleString()}</p>
                            <p><strong>End Date:</strong> {new Date(booking.endDate).toLocaleString()}</p>
                            <p><strong>Status:</strong> {booking.status}</p>
                        </div>
                    ))
                ) : (
                    <p>No accepted bookings at this time.</p>
                )}

                <h2>Rejected Bookings</h2>
                {bookings.rejected.length > 0 ? (
                    bookings.rejected.map((booking) => (
                        <div key={booking._id} className="booking-card">
                            <h3>{booking.room}</h3>
                            <p><strong>Name:</strong> {booking.name}</p>
                            <p><strong>Email:</strong> {booking.email.join(', ')}</p>
                            <p><strong>Start Date:</strong> {new Date(booking.startDate).toLocaleString()}</p>
                            <p><strong>End Date:</strong> {new Date(booking.endDate).toLocaleString()}</p>
                            <p><strong>Status:</strong> {booking.status}</p>
                        </div>
                    ))
                ) : (
                    <p>No rejected bookings at this time.</p>
                )}
            </div>
        </div>
    );
};

export default Booking;
