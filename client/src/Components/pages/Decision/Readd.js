import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import './Readd.css';


const Readd = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/`, {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the request headers
          }
        });
        const responseData = response.data;
        console.log("Response Data:", responseData);
        if (Array.isArray(responseData.decisionData)) {
          setData(responseData.decisionData);
        } else {
          console.error("Invalid response format:", responseData);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    
    // const token = localStorage.getItem('token');
    // if (token) {
    //   loadData();
    // }

    loadData();
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
      (decision.tag_name && decision.tag_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  console.log('Filtered Data:', filteredData);

  return (
    <div>
      <Link to='/decision'>
        <button className='btn btn-info'>Add Decision</button>
      </Link>
      <input
        type="textt" 
        placeholder="Search by decision name or tag name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table className='styled-table'>
        <thead>
          <tr>
            <th>#</th>
            <th>Decision Name</th>
            {/* <th>Decision Reason</th> */}
            {/* <th>Created By</th> */}
            {/* <th>Creation Date</th> */}
            <th>Decision Due Date</th>
            <th>Decision Taken Date</th>
            <th>User Statement</th>
            <th>Tags</th>
            <th>Decision Reasons</th>
            {/* <th> User Id </th> */}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((decision, index) => (
            <tr key={decision.decision_id}>
              <th scope='row'>{index + 1}</th>
              <td>{decision.decision_name}</td>
              {/* <td>{decision.decision_reason}</td> */}
              {/* <td>{decision.created_by}</td> */}
              {/* <td>{decision.creation_date}</td> */}
              <td>{decision.decision_due_date}</td>
              <td>{decision.decision_taken_date}</td>
              <td>{decision.user_statement}</td>
              <td>
                {decision.tag_name && decision.tag_name.split(',').map(tag => (
                  <div key={tag}>{tag}</div>
                ))}
              </td>

              {/* <td>{decision.decision_reason_text}</td> */}

              <td>
                {decision.decision_reason_text && decision.decision_reason_text.split(',').map(reason => (
                  <div key={reason}>{reason}</div>
                ))}
              </td>
              {/* <td>{decision.user_id}</td> */}
              <td>
                <Link to={`/decision/${decision.decision_id}`}>
                  <button className='btn btn-edit'>Edit</button>
                </Link>
                <button className='btn btn-delete' onClick={() => deleteDecision(decision.decision_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ToastContainer/>
    </div>
  );
};

export default Readd;
