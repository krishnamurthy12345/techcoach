import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Pagination, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './Readd.css';
import { FaToggleOn, FaToggleOff } from "react-icons/fa";


const Readd = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [showCompletedDecisions, setShowCompletedDecisions] = useState(false); // Change initial state to false

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

  // Filtering logic
  const filteredData = data.filter(decision => {
    if (showCompletedDecisions) {
      return !decision.decision_taken_date;
    } else {
      return true;
    }
  }).filter(decision => {
    return (
      decision.decision_name && decision.decision_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (decision.tagsArray && decision.tagsArray.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Event handler for page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to delete a decision
  const deleteDecision = async (id) => {
    if (window.confirm("Are you sure that you want to delete this decision?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/details/${id}`);
        toast.success("Decision deleted successfully");
        setData(prevData => prevData.filter(decision => decision.decision_id !== id)); // Update data state after deletion
      } catch (error) {
        console.error("Error deleting decision:", error);
        toast.error("An error occurred while deleting the decision");
      }
    }
  };

  return (
    <div className='styled-table'>
      <div className='heAd'>
        <Link to='/decision'>
          <button className='decision'>Add Decision</button>
        </Link>
        <div className='togglebutton'>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="tooltip">Show pending decisions</Tooltip>}
          >
            <div
              type="checkbox"
              onClick={() => setShowCompletedDecisions(!showCompletedDecisions)}
            >
              {showCompletedDecisions ? <FaToggleOn /> : <FaToggleOff />}
            </div>
          </OverlayTrigger>
        </div>
        <input
          type="text"
          className='texttt'
          placeholder="Search by decision name or tag name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <table >
        <thead>
          <tr>
            <th>#</th>
            <th>Decision Name</th>
            <th>Decision Due Date</th>
            <th>Decision Taken Date</th>
            <th>Decision Details</th>
            <th>Tags</th>
            <th>Decision Reasons</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((decision, index) => (
            <tr key={decision.decision_id}>
              <th scope='row'>{indexOfFirstRecord + index + 1}</th>
              <td>{decision.decision_name}</td>
              <td>{new Date(decision.decision_due_date).toLocaleDateString()}</td>
              <td>{decision.decision_taken_date ? new Date(decision.decision_taken_date).toLocaleDateString() : ""}</td>
              <td>{decision.user_statement}</td>
              <td>{decision.tagsArray && decision.tagsArray.join(', ')}</td>
              <td>
                {decision.decision_reason_text && decision.decision_reason_text.map(reason => (
                  <div key={reason}>{reason}</div>
                ))}
              </td>
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
      <Pagination>
        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
        {pageNumbers.map(number => (
          <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
            {number}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pageNumbers.length} />
      </Pagination>

      <ToastContainer />
    </div>
  );
};

export default Readd;
