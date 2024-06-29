import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Logs.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/logs');
        setLogs(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Error fetching logs. Please try again later.');
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="logs-container">
      <h1>Room Logs</h1>
      <table className="logs-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Room</th>
            <th>Reason</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Completed Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td>{log.name}</td>
              <td>{log.room}</td>
              <td>{log.reason}</td>
              <td>{new Date(log.startDate).toLocaleString()}</td>
              <td>{new Date(log.endDate).toLocaleString()}</td>
              <td>{log.completedDate ? new Date(log.completedDate).toLocaleString() : 'N/A'}</td>
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

export default Logs;
