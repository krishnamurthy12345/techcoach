import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { Pagination, IconButton, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, CircularProgress } from '@mui/material';
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
      (decision.decision_name && decision.decision_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (decision.tagsArray && decision.tagsArray.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

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

  const getMemberCommentCount = (decisionId) => {
    if (comments[decisionId]) {
      return comments[decisionId].filter(comment => comment.type_of_user === 'member').length;
    }
    return 0;
  };

  return (
    <Box sx={{ padding: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Link to='/decision'>
          <Button variant="contained"  
          sx={{
                backgroundColor:"#526D82",
                '&:hover': {
                  backgroundColor: "#405060", 
                },
              }}
              >Add Decision</Button>
        </Link>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: '0.5rem',marginLeft:"1rem", color:"#5c5c5b" }}>Show pending decisions</label>
          <label className="custom-switch">
            <input 
              type="checkbox" 
              checked={showCompletedDecisions}
              onChange={() => setShowCompletedDecisions(!showCompletedDecisions)} 
            />
            <span className="slider"></span>
          </label>
          <Box
            component="input"
            placeholder="Search by decision name or tag name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              marginLeft: 2,
              borderRadius: "0.5rem",
              border: "0.1rem solid #526D82",
              padding: "0.4rem",
              width: '100%', 
              maxWidth: "10rem", 
              '@media (max-width: 600px)': { 
                maxWidth: "5rem",
              },
              '&:focus': {
                outline: "none"
              },
            }}
          />
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{
            backgroundColor:"#526D82"
          }}
          >
            <TableRow>
              <TableCell sx={{color:"white"}}>#</TableCell>
              <TableCell sx={{color:"white"}}>Decision Name</TableCell>
              <TableCell sx={{color:"white"}}>Decision Due Date</TableCell>
              <TableCell sx={{color:"white"}}>Decision Taken Date</TableCell>
              <TableCell sx={{color:"white"}}>Decision Details</TableCell>
              <TableCell sx={{color:"white"}}>Tags</TableCell>
              <TableCell sx={{color:"white"}}>Decision Reasons</TableCell>
              <TableCell sx={{color:"white"}}>Comments</TableCell>
              <TableCell sx={{color:"white"}}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRecords.map((decision, index) => (
              <TableRow key={decision.decision_id}>
                <TableCell>{indexOfFirstRecord + index + 1}</TableCell>
                <TableCell>{decision.decision_name}</TableCell>
                <TableCell>{new Date(decision.decision_due_date).toLocaleDateString()}</TableCell>
                <TableCell>{decision.decision_taken_date ? new Date(decision.decision_taken_date).toLocaleDateString() : "--"}</TableCell>
                <TableCell>{decision.user_statement}</TableCell>
                <TableCell>{decision.tagsArray && decision.tagsArray.join(', ')}</TableCell>
                <TableCell>
                  {decision.decision_reason_text && decision.decision_reason_text.map(reason => (
                    <Typography variant="body2" key={reason}>{reason}</Typography>
                  ))}
                </TableCell>
                <TableCell>
                  {comments[decision.decision_id] ? (
                    comments[decision.decision_id].length > 0 ? (
                      <Box sx={{ display: 'flex' }}>
                        <Typography variant="body2">{getMemberCommentCount(decision.decision_id)} comments</Typography>
                      </Box>
                    ) : (
                      "No Comments Found"
                    )
                  ) : (
                    <CircularProgress size={24} />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton component={Link} to={`/decision/${decision.decision_id}`} style={{ color: '#526D82' }}>
                    <MdModeEdit />
                  </IconButton>
                  <IconButton onClick={() => deleteDecision(decision.decision_id)} style={{ color: '#526D82' }}>
                    <MdDelete />
                  </IconButton>
                  <IconButton component={Link} to={`/views/${decision.decision_id}`} style={{ color: '#526D82' }}>
                    <GrFormView />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(e, page) => handlePageChange(page)}
        sx={{
          '& .MuiPaginationItem-page.Mui-selected': {
            backgroundColor: '#526D82',
            color: '#fff',
          },
        }}
      />
    </Box>
      <ToastContainer />
    </Box>
  );
};

export default Readd;
