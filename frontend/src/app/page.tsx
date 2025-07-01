import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      const response = await fetch('http://your-backend-server/get-issues');
      const data = await response.json();
      setIssues(data);
    };

    fetchIssues();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Issue ID</th>
            <th>Description</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td>{issue.id}</td>
              <td>{issue.description}</td>
              <td>{issue.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
