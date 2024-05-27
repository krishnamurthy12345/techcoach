import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Pagination, OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';
import { Avatar, Tooltip as MuiTooltip } from '@mui/material';
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { GrFormView } from "react-icons/gr";
import 'react-toastify/dist/ReactToastify.css';
import './Readd.css';

const Readd = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [showCompletedDecisions, setShowCompletedDecisions] = useState(false);
  const [comments, setComments] = useState({});

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
          responseData.decisionData.forEach(decision => {
            fetchComments(decision.decision_id);
          });
        } else {
          console.error("Invalid response format:", responseData);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    loadData();
  }, []);

  const fetchComments = async (decisionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/comments`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          decisionId: decisionId
        }
      });
      setComments(prevComments => ({
        ...prevComments,
        [decisionId]: response.data.comments
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

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

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const deleteDecision = async (id) => {
    if (window.confirm("Are you sure that you want to delete this decision?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/details/${id}`);
        toast.success("Decision deleted successfully");
        setData(prevData => prevData.filter(decision => decision.decision_id !== id));
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
            overlay={<BootstrapTooltip id="tooltip">Show pending decisions</BootstrapTooltip>}
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
          className='texttt'
          placeholder="Search by decision name or tag name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Decision Name</th>
            <th>Decision Due Date</th>
            <th>Decision Taken Date</th>
            <th>Decision Details</th>
            <th>Tags</th>
            <th>Decision Reasons</th>
            <th>Comments</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((decision, index) => (
            <tr key={decision.decision_id}>
              <th scope='row'>{indexOfFirstRecord + index + 1}</th>
              <td>{decision.decision_name}</td>
              <td>{new Date(decision.decision_due_date).toLocaleDateString()}</td>
              <td>{decision.decision_taken_date ? new Date(decision.decision_taken_date).toLocaleDateString() : "--"}</td>
              <td>{decision.user_statement}</td>
              <td>{decision.tagsArray && decision.tagsArray.join(', ')}</td>
              <td>
                {decision.decision_reason_text && decision.decision_reason_text.map(reason => (
                  <div key={reason}>{reason}</div>
                ))}
              </td>
              <td>
                {comments[decision.decision_id] ? (
                  comments[decision.decision_id].length > 0 ? (
                    comments[decision.decision_id].map((comment, commentIndex) => (
                      <div key={commentIndex} className="comment-box" style={{ display: 'flex', alignItems: 'center', margin:"0.3rem" }}>
                        <div className="comment-avatar" style={{ marginRight: '0.5rem' }}>
                          <MuiTooltip title={comment.displayname} arrow>
                            <Avatar style={{ backgroundColor: "#526D82", color: "white" }}>{comment.displayname[0]}</Avatar>
                          </MuiTooltip>
                        </div>
                        <div className="comment-text" style={{textAlign:"left"}}>
                          {comment.comment}
                        </div>
                      </div>
                    ))
                  ) : (
                    "No Comments Found"
                  )
                ) : (
                  "Loading comments..."
                )}
              </td>
              <td className='action'>
                <Link to={`/decision/${decision.decision_id}`}>
                  <MdModeEdit className='btn-edit' />
                </Link>
                <MdDelete onClick={() => deleteDecision(decision.decision_id)} className='btn-delete' />
                <Link to={`/views/${decision.decision_id}`}>
                  <GrFormView className='btn-view' />
                </Link>
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
