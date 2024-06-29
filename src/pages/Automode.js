import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Automode.css';
import { FaCheckCircle } from 'react-icons/fa';

const Automode = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/rooms-final');
            const automodeResponse = await axios.get('http://localhost:5000/api/automode');
            console.log('API Response:', response.data);

            if (Array.isArray(response.data) && response.data.length > 0) {
                const roomsWithAutomode = response.data.map(room => {
                    const automodeRoom = automodeResponse.data.find(a => a.roomName === room.name);
                    return { ...room, automode: automodeRoom ? automodeRoom.automode : false };
                });
                setRooms(roomsWithAutomode);
            } else {
                setError('No rooms data received or data is not in expected format.');
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            setError('Failed to fetch rooms. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleRoomSelect = (room) => {
        const updatedRooms = rooms.map(r => 
            r._id === room._id ? { ...r, automode: !r.automode } : r
        );
        setRooms(updatedRooms);
        setSelectedRooms(updatedRooms.filter(r => r.automode));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const filteredRooms = rooms.filter(room =>
        room && room.name && room.capacity && (
            room.name.toString().toLowerCase().includes(searchQuery) ||
            room.capacity.toString().toLowerCase().includes(searchQuery)
        )
    );

    const handleAutomodeSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/automode', {
                rooms: rooms.map(room => ({ roomName: room.name, automode: room.automode }))
            });
            console.log('Automode submission response:', response.data);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000); // Hide the dialog box after 3 seconds
        } catch (error) {
            console.error('Error submitting automode:', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="automode-container">
            <h1>Manage Rooms</h1>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchQuery}
                    onChange={handleSearch}
                />
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Room Name</th>
                            <th>Capacity</th>
                            <th>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRooms.length > 0 ? (
                            filteredRooms.map(room => (
                                <tr key={room._id}>
                                    <td>{room.name}</td>
                                    <td>{room.capacity}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            name={`roomSelect_${room._id}`}
                                            checked={room.automode}
                                            onChange={() => handleRoomSelect(room)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="no-rooms">No rooms found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <button onClick={handleAutomodeSubmit}>Submit Automode</button>

            {showSuccess && (
                <div className="success-dialog">
                    <FaCheckCircle size={50} color="green" />
                    <p>Successfully turned on automode</p>
                </div>
            )}
             <div class="copyright">
     <p>&copy; Shivangi Suyash. All rights reserved.</p>
    </div>
        </div>
    );
};

export default Automode;
