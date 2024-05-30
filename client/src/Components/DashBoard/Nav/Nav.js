import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Box } from '@mui/material';
import { AssignmentTurnedIn, Height, HourglassEmpty, Share } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Nav.css';
import { useNavigate } from 'react-router-dom';

const Nav = () => {
  const navigate=useNavigate();

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPendingDecisions, setShowPendingDecisions] = useState(false);
  const [pendingDecisionsData, setPendingDecisionsData] = useState([]);
  const [sharedDecisionsCount, setSharedDecisionsCount] = useState(0);
  let loggedInUserId;
  
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
    console.log("pending decisions", pendingDecisions);
    setPendingDecisionsData(pendingDecisions);
  }, [data, loggedInUserId]);

  useEffect(() => {
    const sharedDecisionCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/sharedDecisionCount`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const sharedDecisions = response.data.result.length;
        setSharedDecisionsCount(sharedDecisions)
        //console.log("response from shared Decision", response);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    sharedDecisionCount();
  }, []);

  const filteredData = data.filter(decision => {
    return (
      decision.user_id === loggedInUserId &&
      ((decision.decision_name && decision.decision_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (decision.tagsArray && decision.tagsArray.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (!decision.decision_taken_date)) 
    );
  });

  const liveDecisionsCount = filteredData.length;

  const pendingDecisionsCount = pendingDecisionsData.length;

  const togglePendingDecisions = () => {
    setShowPendingDecisions(!showPendingDecisions);
  };

  const navigateToSharedDecisions = () => {
    navigate('/sharedDecisions');
  };

  const navigateToTotalDecisions = () => {
    navigate('/readd');
  };

  return (
    <div style={{ maxWidth: "95%" }}>
      <Grid container spacing={4} style={{ margin: "1rem" }}>
        <Grid item xs={12} sm={4}>
          <CustomCard
            icon={<AssignmentTurnedIn />}
            title="Total Decisions"
            count={liveDecisionsCount}
            onClick={navigateToTotalDecisions}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomCard
            icon={<HourglassEmpty />}
            title="Pending Decisions"
            count={pendingDecisionsCount}
            onClick={togglePendingDecisions}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomCard
            icon={<Share />}
            title="Shared Decisions"
            count={sharedDecisionsCount}
            onClick={navigateToSharedDecisions}
          />
        </Grid>
      </Grid>
      <Grid container spacing={4} style={{ margin: "1rem" }}>
        <Grid item xs={12} sm={12}>
          {showPendingDecisions && (
            <div>
              <Typography variant="h6" style={{ marginBottom: "1rem" }}>Pending Decisions</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: '#526D82', color: '#ffffff', border: '1px solid #ffffff' }}>
                        <Typography variant="h6">Decision Name</Typography>
                      </TableCell>
                      <TableCell sx={{ backgroundColor: '#526D82', color: '#ffffff', border: '1px solid #ffffff' }}>
                        <Typography variant="h6">Decision Due Date</Typography>
                      </TableCell>
                      <TableCell sx={{ backgroundColor: '#526D82', color: '#ffffff', border: '1px solid #ffffff' }}>
                        <Typography variant="h6">Decision Details</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingDecisionsData.map((decision, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ border: '1px solid #526D82' }}>{decision.decision_name}</TableCell>
                        <TableCell sx={{ border: '1px solid #526D82' }}>{new Date(decision.decision_due_date).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ border: '1px solid #526D82' }}>{decision.user_statement}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

const CustomCard = ({ icon, title, count, onClick }) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const cardStyle = {
    marginBottom: 12,
    border: '1px solid #526D82',
    borderRadius: '8px',
    backgroundColor: hovered ? '#d7ebfc' : '#ffffff',
    width: hovered ? "100%" : "95%",
    height: hovered ? "100%" : "95%",
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out'
  };

  return (
    <Card
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={cardStyle}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {icon}
        <Typography variant="h5" sx={{ marginLeft: '8px' }}>{title}</Typography>
      </Box>
      <Box>
        <Typography variant="h4">{count}</Typography>
      </Box>
</Card>
);
};
export default Nav;