import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'bootstrap/dist/css/bootstrap.min.css';
import './Nav.css';

const Nav = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPendingDecisions, setShowPendingDecisions] = useState(false);
  const [pendingDecisionsData, setPendingDecisionsData] = useState([]);
  const [sharedDecisionsCount, setSharedDecisionsCount] = useState(0); // State for shared decisions count
  const loggedInUserId = ''; // Set loggedInUserId

  const navigate = useNavigate(); // Get navigate function

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const responseData = response.data;
        if (Array.isArray(responseData.decisionData)) {
          setData(responseData.decisionData);
        } else {
          console.error("Invalid response format:", responseData);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const pendingDecisions = data.filter(decision => {
      return decision.user_id === loggedInUserId && !decision.decision_taken_date;
    });
    setPendingDecisionsData(pendingDecisions);
  }, [data, loggedInUserId]);

  useEffect(() => {
    // Calculate shared decisions count
    const sharedDecisions = data.filter(decision => {
      return decision.user_id === loggedInUserId && decision.shared_decision;
    });
    setSharedDecisionsCount(sharedDecisions.length);
  }, [data, loggedInUserId]);

  const filteredData = data.filter(decision => {
    return (
      decision.user_id === loggedInUserId &&
      ((decision.decision_name && decision.decision_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (decision.tagsArray && decision.tagsArray.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (!decision.decision_taken_date)) // Filter out decisions with a taken date, meaning pending decisions
    );
  });

  // Count live decisions
  const liveDecisionsCount = filteredData.length;

  // Count pending decisions
  const pendingDecisionsCount = pendingDecisionsData.length;

  const togglePendingDecisions = () => {
    setShowPendingDecisions(!showPendingDecisions);
  };

  // Function to navigate to shared decisions
  const navigateToSharedDecisions = () => {
    navigate('/sharedDecisions'); 
  };

  return (
    <div>
      <div className="row row-cols-1 row-cols-md-2 g-2 homepage">
        <div className="col">
          <div className="card">
            <div className="card-body1">
              <h5 className="card-title">Total Logged Decisions</h5>
              <p className="card-text">{liveDecisionsCount}</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card" onClick={togglePendingDecisions}>
            <div className="card-body2">
              <h5 className="card-title">Pending Decisions</h5>
              <p className="card-text">{pendingDecisionsCount}</p>
              <p className="card-text">{showPendingDecisions ? '' : 'Click to show'}</p> 
            </div>
          </div>
        </div>
      </div> 
      <br />
      <div style={{display:"flex", justifyContent:"center", cursor:"pointer"}} className="col" onClick={navigateToSharedDecisions}>
      <div className="card" onClick={togglePendingDecisions}>
            <div className="card-body1">
        <p>Shared Decisions</p>
        </div>
          </div>
      </div> 
      {showPendingDecisions && (
        <div>
          <h2>Pending Decisions</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Decision Name</th>
                <th>Decision Due Date</th>
                <th>Decision Taken Date</th>
                <th>Decision Details</th>
              </tr>
            </thead>
            <tbody>
              {pendingDecisionsData.map((decision,index) => (
                <tr key={index}>
                  <td>{decision.decision_name}</td>
                  <td>{new Date(decision.decision_due_date).toLocaleDateString()}</td>
                  <td>{decision.decision_taken_date ? new Date(decision.decision_taken_date).toLocaleDateString():'No Decision Date Taken'}</td>
                  <td>{decision.user_statement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default Nav;