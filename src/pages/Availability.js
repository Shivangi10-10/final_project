import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Availability.css';

const Availability = () => {
  const [rooms, setRooms] = useState([]);
  const [maintenanceRooms, setMaintenanceRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredBooking, setHoveredBooking] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, maintenanceResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/rooms-final'),
          axios.get('http://localhost:5000/api/maintenance')
        ]);
        setRooms(roomsResponse.data);
        setMaintenanceRooms(maintenanceResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSlotHover = (event, roomNumber, startTime) => {
    try {
      const roomBookings = rooms.find(room => room.name === roomNumber)?.bookings || [];
      const hoveredBooking = roomBookings.find(booking =>
        booking.status === 'accepted' &&
        new Date(booking.startDate).getTime() <= startTime &&
        new Date(booking.endDate).getTime() > startTime
      );

      if (hoveredBooking) {
        setHoveredBooking(hoveredBooking);
        setTooltipPosition({ x: event.clientX, y: event.clientY });
      } else {
        setHoveredBooking(null);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setHoveredBooking(null);
    }
  };

  const renderTimeline = (roomNumber) => {
    const timelineSlots = [];
    const roomBookings = rooms.find(room => room.name === roomNumber)?.bookings || [];
    const isRoomUnderMaintenance = maintenanceRooms.some(maintenance => maintenance.room === roomNumber);

    const startHour = 8.5; // 8:30 AM
    const endHour = 18; // 6:00 PM

    for (let hour = startHour; hour < endHour; hour += 0.5) {
      const currentSlotStart = new Date(currentDate);
      currentSlotStart.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);

      let slotColor = 'green';
      let slotText = '';

      if (isRoomUnderMaintenance) {
        slotColor = 'grey';
      } else {
        const acceptedBooking = roomBookings.find(booking =>
          booking.status === 'accepted' &&
          new Date(booking.startDate).getTime() <= currentSlotStart &&
          new Date(booking.endDate).getTime() > currentSlotStart
        );

        if (acceptedBooking) {
          slotColor = 'red';
          slotText = 'Booked';
        }
      }

      timelineSlots.push(
        <div
          key={`hour-${hour}`}
          className="timeline-slot"
          style={{ backgroundColor: slotColor }}
          onMouseEnter={(event) => handleSlotHover(event, roomNumber, currentSlotStart.getTime())}
          onMouseLeave={() => setHoveredBooking(null)}
        >
          {slotText}
        </div>
      );
    }

    return timelineSlots;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="availability-container">
      <div className="header">
        <h1>Room Availability</h1>
        <div className="current-date">
          {formatDate(currentDate)}
        </div>
      </div>
      <div className="timeline">
        <div className="timeline-header">
          <div className="room-label">Rooms</div>
          {[...Array(19)].map((_, index) => (
            <div key={`hour-${index}`} className="hour-label">
              {8 + Math.floor(index / 2)}:{index % 2 === 0 ? '00' : '30'}
            </div>
          ))}
        </div>
        {rooms.map((room, index) => (
          <div key={`room-${index + 1}`} className="room-timeline">
            <div className="room-label">{room.name}</div>
            {renderTimeline(room.name)}
          </div>
        ))}
      </div>
      {hoveredBooking && (
        <div
          className="booking-tooltip"
          style={{ top: tooltipPosition.y, left: tooltipPosition.x }}
        >
          <h3>Name: {hoveredBooking.name}</h3>
          <p>Subject: {hoveredBooking.subject}</p>
        </div>
      )}
       <div className="copyright">
         <p>&copy; Shivangi Suyash. All rights reserved.</p>
        </div>
    </div>
  );
};

export default Availability;
