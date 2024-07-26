import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSharedDecisionDetails } from '../Group/Network_Call';
import withAuth from '../withAuth';
import './Nav/Nav.css';
import { Card, Typography, Grid, CircularProgress, Box, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const ShareWithMe = () => {
  const [sharedDecisionDetails, setSharedDecisionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedDecisionsDetails = async () => {
      try {
        const details = await getSharedDecisionDetails();
        setSharedDecisionDetails(details);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch shared decisions details", error);
        setLoading(false);
      }
    };
    fetchSharedDecisionsDetails();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!sharedDecisionDetails || !sharedDecisionDetails.sharedDecisions || sharedDecisionDetails.sharedDecisions.length === 0) {
    return (
      <div className='mt-5 sharebutton'>
        <center>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card className="share-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom className="share-message">
                    To share a decision, open one of your decisions and share with your Inner Circle
                  </Typography>
                  <Link to='/innerCircleDisplay'>
                    <Button variant="contained" color="primary" className="share-button">
                      Click me
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </center>
      </div>
    );
  }

  const getUserName = (userId) => {
    const user = sharedDecisionDetails.tasks.find(task => task.user_id === userId);
    return user ? user.displayname : 'Unknown User';
  };

  const getDecisionName = (decisionId) => {
    const decision = sharedDecisionDetails.decisions.find(decision => decision.decision_id === decisionId);
    return decision ? decision.decision_name : 'Unknown Decision';
  };

  const handleCardClick = (decisionId) => {
    navigate(`/views/${decisionId}`);
  };

  return (
    <div style={{ margin: "1rem" }}>
      <Grid container spacing={2}>
        {sharedDecisionDetails.sharedDecisions.map(sharedDecision => (
          <Grid item xs={12} sm={6} md={4} key={sharedDecision.id} >
            <Card onClick={() => handleCardClick(sharedDecision.decisionId)} style={{ cursor: 'pointer', border: "0.01rem solid #3F5362" }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  {getDecisionName(sharedDecision.decisionId)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Shared By: {getUserName(sharedDecision.groupMember)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

const NoRecordsCard = ({ message }) => {
  const cardStyle = {
    marginBottom: 12,
    border: '1px solid #526D82',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    width: '70%',
    height: '70%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '15px',
    textAlign: 'center'
  };

  return (
    <Card style={cardStyle}>
      <Typography variant="body1">{message}</Typography>
    </Card>
  );
};

export default withAuth(ShareWithMe);
