import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Ongoing.css';

const Ongoing = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAcceptedBookings = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/forms');
                console.log('All bookings:', response.data);

                // Filter for accepted and ongoing bookings
                const now = new Date();
                const ongoingBookings = response.data.filter(booking => {
                    const startDate = new Date(booking.startDate);
                    const endDate = new Date(booking.endDate);
                    return booking.status === 'accepted' && startDate <= now && endDate >= now;
                });

                console.log('Ongoing bookings:', ongoingBookings);
                setBookings(ongoingBookings);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching bookings:', err);
                setError('Error fetching ongoing bookings. Please try again later.');
                setLoading(false);
            }
        };

        fetchAcceptedBookings();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="ongoing-container">
            <h1>Ongoing Bookings</h1>
            <div className="booking-list">
                {bookings.length === 0 ? (
                    <p>No ongoing bookings at the moment.</p>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking._id} className="booking-card">
                            <p><strong>Room:</strong> {booking.room}</p>
                            <p><strong>Name:</strong> {booking.name}</p>
                            <p><strong>Email:</strong> {Array.isArray(booking.email) ? booking.email.join(', ') : booking.email}</p>
                            <p><strong>Subject:</strong> {booking.subject}</p>
                            <p><strong>Start Time:</strong> {new Date(booking.startDate).toLocaleString()}</p>
                            <p><strong>End Time:</strong> {new Date(booking.endDate).toLocaleString()}</p>
                            <p><strong>Status:</strong> {booking.status}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Ongoing;