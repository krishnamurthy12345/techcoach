import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Decision.css'

const Readd = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const id = localStorage.getItem('user_id');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/details/${id}`);
        const responseData = response.data;
  
        if (Array.isArray(responseData)) {
          // If responseData is an array, assume it's the decisions array
          setData(responseData);
        } else if (typeof responseData === 'object' && responseData !== null) {
          // If responseData is an object, assume it's a single decision object
          setData([responseData]); // Wrap the single decision object in an array
        } else {
          console.error("Invalid response format:", responseData);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
        // Handle error
      }
    };
  
    loadData(); // Call loadData on component mount
  }, []);
  

  const deleteDecision = async (id) => {
    if (window.confirm("Are you sure that you want to delete this decision?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/details/${id}`);
        toast.success("Decision deleted successfully");
        setData(prevData => prevData.filter(decision => decision.decision_id !== id)); // Update data state after deletion
      } catch (error) {
        console.error("Error deleting decision:", error);
      }
    }
  };

  const filteredData = data.filter(decision => {
    return (
      (decision.decision_name && decision.decision_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
            {/* <th>Decision Reason</th> */}
            <th>Created By</th>
            <th>Creation Date</th>
            <th>Decision Due Date</th>
            <th>Decision Taken Date</th>
            <th>User Statement</th>
            <th>Tags</th>
            <th>Decision Reasons</th>
            <th> User Id </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((decision, index) => (
            <tr key={decision.decision_id}>
              <th scope='row'>{index + 1}</th>
              <td>{decision.decision_name}</td>
             {/* <td>{decision.decision_reason}</td> */}
              <td>{decision.created_by}</td>
              <td>{decision.creation_date}</td>
              <td>{decision.decision_due_date}</td>
              <td>{decision.decision_taken_date}</td>
              <td>{decision.user_statement}</td>
              <td>{decision.tags}</td>
              {/* <td>{decision.decision_reason_text}</td> */}
              <td>
                {/* Render each decision_reason_text individually */}
                {decision.decision_reason_text && decision.decision_reason_text.map(reason => (
                  <div key={reason.id}>{reason.decision_reason_text}</div>
                ))}
              </td>
              <td>{decision.user_id}</td>

              <td>
                <Link to={`/decision/${decision.decision_id}`}>
                  <button className='btn btn-secondary'>Edit</button>
                </Link>
                <button className='btn btn-danger' onClick={() => deleteDecision(decision.decision_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Readd;
