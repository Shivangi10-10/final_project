    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import './Cancel.css';
    import { FaTimes } from 'react-icons/fa';

    const Cancel = () => {
        const [formData, setFormData] = useState([]);
        const [filteredData, setFilteredData] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [searchQuery, setSearchQuery] = useState('');
        const [showDialog, setShowDialog] = useState(false);
        const [selectedForm, setSelectedForm] = useState(null);

        useEffect(() => {
            const fetchFormData = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/forms');
                    setFormData(response.data);
                    setFilteredData(response.data);
                    setLoading(false);
                } catch (err) {
                    setError('Error fetching form data. Please try again later.');
                    setLoading(false);
                }
            };

            fetchFormData();
        }, []);

        const handleCancel = async (id) => {
            try {
                await axios.delete(`http://localhost:5000/api/forms/${id}`);
                const updatedData = formData.filter(item => item._id !== id);
                setFormData(updatedData);
                setFilteredData(updatedData);
                setShowDialog(false);
            } catch (err) {
                setError('Error cancelling form. Please try again.');
            }
        };

        const handleSearch = (e) => {
            setSearchQuery(e.target.value);
            const filtered = formData.filter(form =>
                form.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
                form.subject.toLowerCase().includes(e.target.value.toLowerCase())
            );
            setFilteredData(filtered);
        };

        const openDialog = (form) => {
            setSelectedForm(form);
            setShowDialog(true);
        };

        const closeDialog = () => {
            setShowDialog(false);
            setSelectedForm(null);
        };

        if (loading) return <div>Loading...</div>;
        if (error) return <div>{error}</div>;

        return (
            <div className="cancel-container">
                <div className="cancel-header">
                    <h1>Cancel Submitted Forms</h1>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search "
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
                {filteredData.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((form) => (
                                    <tr key={form._id}>
                                        <td data-label="Subject">{form.subject}</td>
                                        <td data-label="Name">{form.name}</td>
                                        <td data-label="Email">{form.email.join(', ')}</td>
                                        <td data-label="Start Date">{new Date(form.startDate).toLocaleString()}</td>
                                        <td data-label="End Date">{new Date(form.endDate).toLocaleString()}</td>
                                        <td data-label="Actions" className="actions">
                                            <FaTimes className="cancel-icon" onClick={() => openDialog(form)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="no-forms">No forms submitted at this time.</p>
                )}

                {showDialog && selectedForm && (
                    <>
                        <div className="overlay" onClick={closeDialog}></div>
                        <div className="dialog">
                            <h3>Are you sure you want to cancel the booking?</h3>
                            <div className="dialog-actions">
                                <button className="cancel-button" onClick={() => handleCancel(selectedForm._id)}>Yes</button>
                                <button className="close-button" onClick={closeDialog}>No</button>
                            </div>
                        </div>
                    </>
                )}
                <div class="copyright">
         <p>&copy; Shivangi Suyash. All rights reserved.</p>
        </div>
            </div>
        );
    };

    export default Cancel;
