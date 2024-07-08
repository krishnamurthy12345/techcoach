import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { Pagination, IconButton, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, CircularProgress, Select, MenuItem } from '@mui/material';
import { MdDelete, MdModeEdit } from 'react-icons/md';
import { GrFormView } from 'react-icons/gr';
import { DataGrid } from '@mui/x-data-grid';
import 'react-toastify/dist/ReactToastify.css';
import './Readd.css';
import withAuth from '../../withAuth';

const Readd = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [showPendingDecisions, setShowPendingDecisions] = useState(false);
  const [comments, setComments] = useState({});
  const [view, setView] = useState('table');
  const [expandedDecision, setExpandedDecision] = useState(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [sortCriteria, setSortCriteria] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');


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
          // Sort decisions by date (most recent first)
          const sortedData = responseData.decisionData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setData(sortedData);
          sortedData.forEach(decision => {
            fetchComments(decision.decision_id);
          });
        } else {
          console.error('Invalid response format:', responseData);
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    loadData();
  }, []);

 

  const fetchComments = async decisionId => {
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
      console.error('Error fetching comments:', error);
    }
  };

  const handleSortByDueDate = () => {
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.decision_due_date);
      const dateB = new Date(b.decision_due_date);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setData(sortedData);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const filteredData = data
    .filter(decision => (showPendingDecisions ? !decision.decision_taken_date : true))
    .filter(decision => {
      return (
        (decision.decision_name &&
          decision.decision_name.toLowerCase().includes(selectedTag.toLowerCase())) ||
        (decision.tagsArray &&
          decision.tagsArray.some(tag => tag.toLowerCase().includes(selectedTag.toLowerCase())))
      );
    });

  // Calculate indices for the current page
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  const renderTableView = () => (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      <Table>
        <TableHead sx={{ backgroundColor: '#526D82' }}>
          <TableRow>
            <TableCell sx={{ color: 'white' }}>#</TableCell>
            <TableCell sx={{ color: 'white' }}>Decision Name</TableCell>
            <TableCell sx={{ color: 'white', cursor: 'pointer' }} onClick={handleSortByDueDate}>
              Due Date {sortDirection === 'asc' ? '▲' : '▼'}
            </TableCell>
            <TableCell sx={{ color: 'white' }}>Taken Date</TableCell>
            <TableCell sx={{ color: 'white' }}>Details</TableCell>
            <TableCell sx={{ color: 'white' }}>Tags</TableCell>
            <TableCell sx={{ color: 'white' }}>Reasons</TableCell>
            <TableCell sx={{ color: 'white' }}>Comments</TableCell>
            <TableCell sx={{ color: 'white' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentRecords.map((decision, index) => {
            const isPastDueDate = new Date(decision.decision_due_date) < new Date() && !decision.decision_taken_date;
            return (
              <TableRow key={decision.decision_id} sx={{ backgroundColor: isPastDueDate ? '#ffcccc' : 'inherit' }}>
                <TableCell>{indexOfFirstRecord + index + 1}</TableCell>
                <TableCell>{decision.decision_name}</TableCell>
                <TableCell>{new Date(decision.decision_due_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {decision.decision_taken_date
                    ? new Date(decision.decision_taken_date).toLocaleDateString()
                    : '--'}
                </TableCell>
                <TableCell>{decision.user_statement}</TableCell>
                <TableCell>{decision.tagsArray && decision.tagsArray.join(', ')}</TableCell>
                <TableCell>
                  {decision.decision_reason_text &&
                    decision.decision_reason_text.map(reason => (
                      <Typography variant="body2" key={reason}>
                        {reason}
                      </Typography>
                    ))}
                </TableCell>
                <TableCell>
                  {comments[decision.decision_id] ? (
                    comments[decision.decision_id].length > 0 ? (
                      <Box sx={{ display: 'flex' }}>
                        <Typography variant="body2">
                          {comments[decision.decision_id].length} comments
                        </Typography>
                      </Box>
                    ) : (
                      'No Comments Found'
                    )
                  ) : (
                    <CircularProgress size={24} />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/decision/${decision.decision_id}`}
                    style={{ color: '#526D82' }}
                  >
                    <MdModeEdit />
                  </IconButton>
                  <IconButton onClick={() => deleteDecision(decision.decision_id)} style={{ color: '#526D82' }}>
                    <MdDelete />
                  </IconButton>
                  <IconButton
                    component={Link}
                    to={`/views/${decision.decision_id}`}
                    style={{ color: '#526D82' }}
                  >
                    <GrFormView />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  const renderTabularView = () => {
    const tagCounts = {};
    data.forEach((decision) => {
      if (decision.tagsArray) {
        decision.tagsArray.forEach((tag) => {
          if (tagCounts[tag]) {
            tagCounts[tag]++;
          } else {
            tagCounts[tag] = 1;
          }
        });
      }
    });
  
    const sortedTags = Object.keys(tagCounts).sort((a, b) => {
      if (sortCriteria === 'name') {
        return a.localeCompare(b);
      } else {
        return tagCounts[b] - tagCounts[a];
      }
    });
  
    const columns = [
      {
        field: 'tag',
        headerName: 'Tag Name',
        width: 400,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'count',
        headerName: 'Decisions Count',
        width: 375,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'count',
        headerName: 'Decisions Count',
        width: 200, // Adjust width as needed
        headerClassName: 'super-app-theme--header',
      },
    ];
  
    const rows = sortedTags.map((tag, index) => ({
      id: index,
      tag,
      count: tagCounts[tag],
    }));
  
    return (
      <TableContainer component={Paper} sx={{  padding: 2, maxWidth: '800px',margin: 'auto', borderRadius:'10px', }}>
        <DataGrid
          rows={rows.slice(0, 50)}
          columns={columns}
          autoHeight
          pageSize={50}
          rowsPerPageOptions={[50]}
          // disableSelectionOnClick
          hideFooter
          sx={{
            '& .super-app-theme--header': {
              backgroundColor: '#526D82',
              // color: 'red',
              '& .super-app-theme--header:hover':{
                backgroundColor:'rgb(197, 200, 202)'
              }
            },
          //   '& .MuiDataGrid-columnHeader-sortIcon': {
          //   color: 'red',
          //   backgroundColor: '#526D82',
          //   '& .MuiDataGrid-columnHeader-sortIcon:hover': {
          //     color: 'orange', 
          //   },
          // },
          '& .MuiDataGrid-cell': {
            textAlign: 'baseline', 
          },
          }}
        />
      </TableContainer>
    );
  };

  const renderTimelineView = () => {
    const tags = [...new Set(data.flatMap(decision => decision.tagsArray))];

    return (
      <Box sx={{ position: 'relative', marginTop: 2 }}>
        <Box sx={{ position: 'absolute', left: '50%', top: '0%', bottom: '0%', width: '4px', backgroundColor: '#526D82', transform: 'translateX(-50%)', borderRadius: '0.1rem', zIndex: 1 }} />
        {tags.map((tag, tagIndex) => (
          <Box key={tag} sx={{ marginBottom: 4 }}>
            <Typography variant="h6" sx={{ color: '#526D82', textAlign: 'center', marginBottom: 2, backgroundColor: '#DDE6ED', borderRadius: '4px', padding: '4px', zIndex: 2, position: 'relative' }}>{tag}</Typography>
            {filteredData.filter(decision => decision.tagsArray.includes(tag) && (selectedTag === '' || tag === selectedTag)).map((decision, index) => (
              <Box
                key={decision.decision_id}
                sx={{
                  display: 'flex',
                  justifyContent: tagIndex % 2 === 0 ? 'flex-start' : 'flex-end',
                  position: 'relative',
                  marginBottom: 2
                }}
              >
                <Box
                  sx={{
                    width: '45%',
                    backgroundColor: expandedDecision === decision.decision_id ? '#526D82' : 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #526D82',
                    position: 'relative',
                    cursor: 'pointer',
                    boxShadow: expandedDecision === decision.decision_id ? '0px 0px 10px 2px rgba(82, 109, 130, 0.7)' : 'none'
                  }}
                  onClick={() => setExpandedDecision(expandedDecision === decision.decision_id ? null : decision.decision_id)}
                >
                  <Typography variant="body2" sx={{ marginLeft: 2 }}>
                    {decision.decision_name}
                  </Typography>
                </Box>
                {expandedDecision === decision.decision_id && (
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', zIndex: 3 }}>
                    <Typography variant="h6" sx={{ color: '#526D82', marginBottom: '0.5rem' }}>Decision Details</Typography>
                    <Typography variant="body2">Decision Due Date: {new Date(decision.decision_due_date).toLocaleDateString()}</Typography>
                    <Typography variant="body2">Decision Taken Date: {decision.decision_taken_date ? new Date(decision.decision_taken_date).toLocaleDateString() : '--'}</Typography>
                    <Typography variant="body2">Decision Details: {decision.user_statement}</Typography>
                    <Typography variant="body2">Tags: {decision.tagsArray && decision.tagsArray.join(', ')}</Typography>
                    <Typography variant="body2">Decision Reasons:</Typography>
                    {decision.decision_reason_text && decision.decision_reason_text.map(reason => (
                      <Typography key={reason} variant="body2" sx={{ marginLeft: 2 }}>
                        - {reason}
                      </Typography>
                    ))}
                    <Typography variant="body2">Comments: {comments[decision.decision_id] ? comments[decision.decision_id].length : 0}</Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    );
  };

  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const deleteDecision = async id => {
    if (window.confirm('Are you sure that you want to delete this decision?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/details/${id}`);
        toast.success('Decision deleted successfully');
        setData(prevData => prevData.filter(decision => decision.decision_id !== id));
      } catch (error) {
        console.error('Error deleting decision:', error);
        toast.error('An error occurred while deleting the decision');
      }
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Link to="/decision" style={{ textDecoration: 'none' }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#526D82',
            color: 'white',
            '&:hover': {
              backgroundColor: '#405060'
            },
            marginBottom: 2
          }}
        >
          Add Decision
        </Button>
      </Link>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Box>
          <Button
            variant={view === 'table' ? 'contained' : 'outlined'}
            onClick={() => setView('table')}
            sx={{
              backgroundColor: view === 'table' ? '#526D82' : undefined,
              color: view === 'table' ? 'white' : '#526D82',
              '&:hover': {
                backgroundColor: view === 'table' ? '#405060' : undefined
              },
              marginRight: 2
            }}
          >
            Table View
          </Button>
          <Button
            variant={view === 'timeline' ? 'contained' : 'outlined'}
            onClick={() => setView('timeline')}
            sx={{
              backgroundColor: view === 'timeline' ? '#526D82' : undefined,
              color: view === 'timeline' ? 'white' : '#526D82',
              '&:hover': {
                backgroundColor: view === 'timeline' ? '#405060' : undefined
              },
              marginRight: 2
            }}
          >
            Timeline View
          </Button>
          <Button
            variant={view === 'tabular' ? 'contained' : 'outlined'}
            onClick={() => setView('tabular')}
            sx={{
              backgroundColor: view === 'tabular' ? '#526D82' : undefined,
              color: view === 'tabular' ? 'white' : '#526D82',
              '&:hover': {
                backgroundColor: view === 'tabular' ? '#405060' : undefined
              }
            }}
          >
            How Am I Doing?
          </Button>
        </Box>
        {(view === 'timeline' || view === 'table') && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '0.5rem', marginLeft: '1rem', color: '#5c5c5b' }}>Show pending decisions</label>
            <label className="custom-switch">
              <input
                type="checkbox"
                checked={showPendingDecisions}
                onChange={() => setShowPendingDecisions(!showPendingDecisions)}
              />
              <span className="slider"></span>
            </label>
            {view === 'table' && (
              <Box
                component="input"
                placeholder="Search by decision name or tag name"
                value={selectedTag}
                onChange={e => setSelectedTag(e.target.value)}
                sx={{
                  marginLeft: 2,
                  borderRadius: '0.5rem',
                  border: '0.1rem solid #526D82',
                  padding: '0.4rem',
                  width: '100%',
                  maxWidth: '15rem',
                  fontSize: '0.8rem',
                  '&:focus': {
                    outline: 'none'
                  }
                }}
              />
            )}
            {view === 'timeline' && (
              <Select
                value={selectedTag}
                onChange={e => setSelectedTag(e.target.value)}
                displayEmpty
                inputProps={{ 'aria-label': 'Select Tag' }}
                sx={{
                  marginLeft: 2,
                  borderRadius: '0.5rem',
                  border: '0.1rem solid #526D82',
                  padding: '0.01rem',
                  width: '100%',
                  maxWidth: '15rem',
                  fontSize: '0.8rem',
                  '@media (max-width: 600px)': {
                    maxWidth: '5rem'
                  },
                  '&:focus': {
                    outline: 'none'
                  }
                }}
              >
                <MenuItem value="">All Tags</MenuItem>
                {[...new Set(data.flatMap(decision => decision.tagsArray))].map((tag, index) => (
                  <MenuItem key={index} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Box>
        )}
      </Box>
      {view === 'table' && renderTableView()}
      {view === 'timeline' && renderTimelineView()}
      {view === 'tabular' && renderTabularView()}
      {(view === 'table' || view === 'tabular') && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <Pagination
            count={Math.ceil(filteredData.length / recordsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            sx={{
              '& .MuiPaginationItem-page.Mui-selected': {
                backgroundColor: '#526D82',
                color: 'white'
              }
            }}
          />
        </Box>
      )}
      <ToastContainer />
    </Box>
  );
};

export default withAuth(Readd);
