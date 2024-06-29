import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import './Trend.css';

// Register the necessary components
Chart.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Trend = () => {
    const [roomUsageData, setRoomUsageData] = useState(null);
    const [peakHoursData, setPeakHoursData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/forms');
                const bookings = response.data;

                // Process room usage data
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

                // Process peak hours data
                const hourCounts = Array(24).fill(0);
                bookings.forEach(booking => {
                    const startHour = new Date(booking.startDate).getHours();
                    const endHour = new Date(booking.endDate).getHours();
                    for (let i = startHour; i <= endHour; i++) {
                        hourCounts[i]++;
                    }
                });

                setPeakHoursData({
                    labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                    datasets: [{
                        label: 'Peak Hours',
                        data: hourCounts,
                        fill: false,
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        borderColor: 'rgba(75,192,192,1)'
                    }]
                });

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Error fetching data. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="trend-container">
            {roomUsageData && (
                <div className="chart-container">
                    <h2>Room Usage Distribution</h2>
                    <Pie data={roomUsageData} />
                </div>
            )}
            {peakHoursData && (
                <div className="chart-container">
                    <h2>Peak Hours</h2>
                    <Line data={peakHoursData} />
                </div>
            )}
            <div class="copyright">
         <p>&copy; Shivangi Suyash. All rights reserved.</p>
        </div>
        </div>
    );
};

export default Trend;