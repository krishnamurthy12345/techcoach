import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Readd = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/all-decisions`);
      let responseData = response.data;
  
      // Check if response is an object with an 'a' property which contains an array
      if (responseData && typeof responseData === 'object' && responseData.hasOwnProperty('a') && Array.isArray(responseData.a)) {
        // If so, extract the array
        responseData = responseData.a;
      }
  
      // Now check if responseData is an array before setting the state
      if (Array.isArray(responseData)) {
        setData(responseData);
      } else {
        console.error("Data received is not an array:", responseData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteDecision = async (id) => {
    if (window.confirm("Are you sure that you want to delete this decision?")) {
      try {
        await axios.delete(`http://localhost:6005/api/details/${id}`);
        toast.success("Decision deleted successfully");
        setTimeout(() => loadData(),0);
      } catch (error) {
        console.error("Error deleting decision:", error);
      }
    }
  };

  const filteredData = data.filter(decision => {
    return (
      decision.decisionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (decision.tags && decision.tags.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  

  return (
    <div>
      <Link to='/decision'>
        <button className='btn btn-info'>Add Decision</button>
      </Link>
      <input
        type="text"
        placeholder="Search by tag name or decision name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table className='styled-table'>
        <thead>
          <tr>
            <th>#</th>
            <th>Decision Name</th>
            <th>Decision Reason</th>
            <th>Created By</th>
            <th>User Creation</th>
            <th>User Statement</th>
            <th>Tags</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((decision, index) => (
            <tr key={decision.decision_id}>
              <th scope='row'>{index + 1}</th>
              <td>{decision.decisionName}</td>
              <td>{decision.decisionReason}</td>
              <td>{decision.created_by}</td>
              <td>{decision.user_Creation}</td>
              <td>{decision.user_Statement}</td>
              <td>{decision.tags}</td>
              <td>
                <Link to={`/decision/${decision.decision_id}`}>
                  <button className='btn btn-secondary'>Edit</button>
                </Link>
                <button className='btn btn-delete' onClick={() => deleteDecision(decision.decision_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Readd;
