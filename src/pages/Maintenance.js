import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Maintenance.css';

const Maintenance = () => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState(1);
    const [maintenanceRooms, setMaintenanceRooms] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);

    useEffect(() => {
        fetchMaintenanceRooms();
        fetchAvailableRooms();
    }, []);

    const fetchMaintenanceRooms = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/maintenance');
            setMaintenanceRooms(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching maintenance rooms:', err);
            setError('Error fetching maintenance rooms. Please try again later.');
            setLoading(false);
        }
    };

    const fetchAvailableRooms = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/rooms-final');
            setAvailableRooms(response.data);
        } catch (err) {
            console.error('Error fetching available rooms:', err);
            setError('Error fetching available rooms. Please try again later.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const startDate = new Date().toISOString();
        const endDate = new Date(new Date().setDate(new Date().getDate() + parseInt(duration))).toISOString();

        const newMaintenanceRoom = { 
            name,
            room, 
            reason, 
            startDate,
            endDate
        };
        try {
            await axios.post('http://localhost:5000/api/maintenance', newMaintenanceRoom);
            setName('');
            setRoom('');
            setReason('');
            setDuration(1);
            fetchMaintenanceRooms();
        } catch (err) {
            console.error('Error adding maintenance room:', err);
            setError('Error adding maintenance room. Please try again.');
        }
    };

    const handleDeleteClick = (id) => {
        setRoomToDelete(id);
        setShowConfirmDialog(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/maintenance/${roomToDelete}`);
            fetchMaintenanceRooms();
            setShowConfirmDialog(false);
        } catch (err) {
            console.error('Error deleting maintenance room:', err);
            setError('Error deleting maintenance room. Please try again.');
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmDialog(false);
        setRoomToDelete(null);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="maintenance-container">
            <h1>Maintenance</h1>
            <form onSubmit={handleSubmit} className="maintenance-form">
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="room">Room</label>
                    <select
                        id="room"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        required
                    >
                        <option value="">Select a room</option>
                        {availableRooms.map((room) => (
                            <option key={room._id} value={room.name}>
                                {room.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="reason">Reason</label>
                    <input
                        type="text"
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="duration">Duration (days)</label>
                    <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        min="1"
                        required
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
            <h2>Rooms Under Maintenance</h2>
            <div className="maintenance-list">
                {maintenanceRooms.map((maintenance) => (
                    <div key={maintenance._id} className="maintenance-card">
                        <p><strong>Name:</strong> {maintenance.name}</p>
                        <p><strong>Room:</strong> {maintenance.room}</p>
                        <p><strong>Reason:</strong> {maintenance.reason}</p>
                        <p><strong>Maintenance Period:</strong></p>
                        <p>From: {formatDate(maintenance.startDate)}</p>
                        <p>To: {formatDate(maintenance.endDate)}</p>
                        <button onClick={() => handleDeleteClick(maintenance._id)}>Delete</button>
                    </div>
                ))}
            </div>
            {showConfirmDialog && (
                <div className="confirm-dialog">
                    <p>Are you sure you want to remove this room from maintenance?</p>
                    <div className="confirm-dialog-buttons">
                        <button className="confirm-yes" onClick={handleConfirmDelete}>Yes</button>
                        <button className="confirm-no" onClick={handleCancelDelete}>No</button>
                    </div>
                </div>
            )}
             <div class="copyright">
     <p>&copy; Shivangi Suyash. All rights reserved.</p>
    </div>
        </div>
    );
};

export default Maintenance;