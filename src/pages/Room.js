import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Room.css';
import { FaTimes, FaCheck } from 'react-icons/fa';

const Room = () => {
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomCapacity, setNewRoomCapacity] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteRoomId, setDeleteRoomId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showRoomTable, setShowRoomTable] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/rooms-final');
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const handleAddRoom = async () => {
        try {
            await axios.post('http://localhost:5000/api/rooms-final', {
                name: newRoomName,
                capacity: parseInt(newRoomCapacity)
            });
            fetchRooms();
            setShowAddDialog(false);
            setNewRoomName('');
            setNewRoomCapacity('');
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
        } catch (error) {
            console.error('Error adding room:', error);
        }
    };

    const openDeleteDialog = (roomId) => {
        setDeleteRoomId(roomId);
        setShowDeleteDialog(true);
    };

    const confirmDeleteRoom = async () => {
        if (deleteRoomId) {
            try {
                await axios.delete(`http://localhost:5000/api/rooms-final/${deleteRoomId}`);
                fetchRooms();
                setShowDeleteDialog(false);
                setDeleteRoomId('');
            } catch (error) {
                console.error('Error deleting room:', error);
            }
        }
    };

    const closeDeleteDialog = () => {
        setShowDeleteDialog(false);
        setDeleteRoomId('');
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const filteredRooms = rooms.filter(room =>
        (room.name && room.name.toLowerCase().includes(searchQuery)) ||
        (room.capacity && room.capacity.toString().toLowerCase().includes(searchQuery))
    );

    return (
        <div className="room-container">
            <div className="room-header">
                <h1>Manage Rooms</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
            </div>
            
            <table className="action-table">
                <tbody>
                    <tr>
                        <td>Add Room</td>
                        <td><button onClick={() => setShowAddDialog(true)}>Add</button></td>
                    </tr>
                    <tr>
                        <td>Delete Room</td>
                        <td>
                            <button 
                                onClick={() => setShowRoomTable(!showRoomTable)}
                                style={{backgroundColor: 'red', color: 'white'}}
                            >
                                {showRoomTable ? 'Hide Rooms' : 'Delete'}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            {showRoomTable && (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Room Name</th>
                                <th>Capacity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRooms.map((room) => (
                                <tr key={room._id}>
                                    <td>{room.name}</td>
                                    <td>{room.capacity}</td>
                                    <td className="actions">
                                        <FaTimes 
                                            className="delete-icon" 
                                            onClick={() => openDeleteDialog(room._id)}
                                            style={{color: 'red', cursor: 'pointer'}}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddDialog && (
                <>
                    <div className="overlay" onClick={() => setShowAddDialog(false)}></div>
                    <div className="dialog">
                        <h3>Add New Room</h3>
                        <label>Room Name:</label>
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                        />
                        <label>Capacity:</label>
                        <input
                            type="number"
                            value={newRoomCapacity}
                            onChange={(e) => setNewRoomCapacity(e.target.value)}
                        />
                        <div className="dialog-actions">
                            <button className="add-room-button" onClick={handleAddRoom}>Add Room</button>
                            <button className="cancel-button" onClick={() => setShowAddDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </>
            )}

            {showDeleteDialog && (
                <>
                    <div className="overlay" onClick={closeDeleteDialog}></div>
                    <div className="dialog">
                        <h3>Are you sure you want to delete this room?</h3>
                        <div className="dialog-actions">
                            <button 
                                className="delete-confirm-button" 
                                onClick={confirmDeleteRoom}
                                style={{backgroundColor: 'red', color: 'white'}}
                            >
                                Yes
                            </button>
                            <button className="cancel-button" onClick={closeDeleteDialog}>No</button>
                        </div>
                    </div>
                </>
            )}

            {showSuccessMessage && (
                <div className="overlay">
                    <div className="dialog success-message">
                        <FaCheck /> Room added successfully!
                    </div>
                </div>
            )}
             <div class="copyright">
     <p>&copy; Shivangi Suyash. All rights reserved.</p>
    </div>
        </div>
    );
};

export default Room;