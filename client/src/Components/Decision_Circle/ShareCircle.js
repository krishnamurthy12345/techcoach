import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';

const ShareCircle = () => {
    const [decision, setDecision] = useState({});
    const [showShareOptions, setShowShareOptions] = useState(false);
    const { id } = useParams();


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/getInfo_Referred/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // console.log("responseeeee from detailssssssssss", response.data.decisionData[0]);
                const responseData = response.data;
                console.log("responseeeee from afterrrrrrrrrrrrrrrrrr", responseData);
                if (responseData && responseData.decisionData && responseData.decisionData.length > 0) {
                    const { decision_name, decision_due_date, decision_taken_date, user_statement, tags, decision_reason,decision_id } = responseData.decisionData[0];
                    const formattedDecisionDueDate = decision_due_date ? new Date(decision_due_date).toISOString().split('T')[0] : '';
                    const formattedDecisionTakenDate = decision_taken_date ? new Date(decision_taken_date).toISOString().split('T')[0] : '';
                    setDecision({
                        decision_id,
                        decision_name,
                        decision_due_date: formattedDecisionDueDate,
                        decision_taken_date: formattedDecisionTakenDate,
                        user_statement,
                        tagsArray: tags.map(tag => ({
                            id: tag.id,
                            tag_name: tag.tag_name,
                            tag_type: tag.tag_type
                        })),
                        decision_reason: decision_reason.map(reasonObj => reasonObj.decision_reason_text),
                    });
                } else {
                    console.error("Invalid response format:", responseData);
                }
            } catch (error) {
                console.error("Error fetching decision data:", error.message);
            }
        };

        fetchData();
    }, [id]);

    const handleShowShareOptions = () => {
        setShowShareOptions(true);
    }


    return (
        <Box sx={{
            padding: "1rem", backgroundColor: "white", margin: "2rem", borderRadius: "0.5rem"
        }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Name:</b> {decision.decision_name}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Details:</b> {decision.user_statement}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Reasons:</b> {decision.decision_reason && decision.decision_reason.join(', ')}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Due Date:</b> {decision.decision_due_date}</Typography>
            </Box>

            {decision.decision_taken_date && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1"><b>Decision Taken Date:</b> {decision.decision_taken_date}</Typography>
                </Box>
            )}

            <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                    <b>Selected Tags:</b> {decision.tagsArray && decision.tagsArray.map(tag => tag.tag_name).join(', ')}
                </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Link to='/readd'>
                    <Button variant="contained">Go back</Button>
                </Link>
            </Box>
            <div>
                <Button sx={{ mb: 2, p: 2, bgcolor: "#526D82", borderRadius: 2, display: "flex", justifyContent: "center", width: "100%" }} variant="contained" onClick={handleShowShareOptions}>
                    Share Above the Decision
                </Button>
            </div>

            {showShareOptions && (
                <Box sx={{ mt: 2, borderRadius: 2, display: "flex", justifyContent: "center" }}>
                    <Link to='/innerCircleDisplay'><Button variant="contained" color="primary" sx={{ mr: 2 }}>
                        Inner Circle
                    </Button>
                    </Link>
                    {decision.decision_id && (
                    <Link to={`/shareCircleDisplay/${decision.decision_id}`}>
                        <Button variant="contained" color="primary">
                            Decision Circle
                        </Button>
                    </Link>
                    )}
                </Box>
            )}
            <ToastContainer />
        </Box>
    );
};

export default ShareCircle;