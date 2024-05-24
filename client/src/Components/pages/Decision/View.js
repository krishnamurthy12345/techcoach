import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, TextField, Button, Avatar } from '@mui/material';
import { checkInnerCircleExists, getInnerCircleDetails, getSharedComments } from '../../Group/Network_Call';
import { useNavigate } from 'react-router-dom';
import ShareModal from '../../Group/ShareModel';

const View = () => {
    const [decision, setDecision] = useState({});
    const { id } = useParams();
    const [innerGroup, setInnerGroup] = useState();
    const [showModal, setShowModal] = useState(false);
    const [innerCircleDetails, setInnerCircleDetails] = useState(null);
    const [sharedComments, setSharedComments] = useState([]);
    const [newReply, setNewReply] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const innerGroupCheck = async () => {
            const innerGroup = await checkInnerCircleExists();
            console.log("inner group", innerGroup);
            setInnerGroup(innerGroup);
        };
        innerGroupCheck();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/details/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const responseData = response.data;
                if (responseData && responseData.decisions && responseData.decisions.length > 0) {
                    const { decision_name, decision_due_date, decision_taken_date, user_statement, user_id, tags, decision_reason_text } = responseData.decisions[0];
                    const formattedDecisionDueDate = decision_due_date ? new Date(decision_due_date).toISOString().split('T')[0] : '';
                    const formattedDecisionTakenDate = decision_taken_date ? new Date(decision_taken_date).toISOString().split('T')[0] : '';
                    setDecision({
                        decision_name,
                        decision_due_date: formattedDecisionDueDate,
                        decision_taken_date: formattedDecisionTakenDate,
                        user_statement,
                        user_id,
                        tagsArray: tags,
                        decision_reason_text: decision_reason_text.map(reasonObj => reasonObj.decision_reason_text),
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

    useEffect(() => {
        const fetchInnerCircleDetails = async () => {
            try {
                const details = await getInnerCircleDetails();
                console.log("inner circle details", details);
                setInnerCircleDetails(details);
            } catch (error) {
                console.error("Failed to fetch inner circle details", error);
            }
        };
        fetchInnerCircleDetails();
    }, []);

    useEffect(() => {
        const fetchSharedComments = async () => {
            console.log("decision id", id);
            try {
                const comments = await getSharedComments(id);
                console.log("response from shared comments", comments.comments);
                setSharedComments(comments.comments);
            } catch (error) {
                console.error("Failed to fetch shared comments", error);
            }
        };

        fetchSharedComments();
    }, [id]);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleShare = () => {
        setShowModal(true);
    };

    const handleReplyChange = (event) => {
        setNewReply(event.target.value);
    };

    const handleReplySubmit = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.REACT_APP_API_URL}/group/reply`, {
                commentId,
                reply: newReply
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNewReply('');
            const comments = await getSharedComments(id);
            setSharedComments(comments);
        } catch (error) {
            console.error("Error submitting reply:", error);
        }
    };

    console.log("shared comments", sharedComments);

    return (
        <Box sx={{ margin: "3rem", backgroundColor: "white", borderRadius: "1rem", padding: "2rem" }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Name:</b>{decision.decision_name}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Details:</b>{decision.user_statement}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Reasons:</b>{decision.decision_reason_text && decision.decision_reason_text.join(', ')}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Due Date:</b>{decision.decision_due_date}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Taken Date:</b>{decision.decision_taken_date}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Selected Tags:</b>{decision.tagsArray && decision.tagsArray.join(', ')}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Link to='/readd'>
                    <Button variant="contained">Go back</Button>
                </Link>
            </Box>
            <Box sx={{ mb: 2, p: 2, bgcolor: "#526D82", borderRadius: 2, display: "flex", justifyContent: "center" }}>
                {innerGroup ? (
                    <Typography variant="body1" sx={{ color: "white", cursor: "pointer" }} onClick={handleShare}>
                        Share The Above Decision in Inner Circle
                    </Typography>
                ) : (
                    <Typography variant="body1" sx={{ color: "white", cursor: "pointer" }} onClick={handleShow}>
                        Create Inner Circle to share this Decision
                    </Typography>
                )}
            </Box>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6">Comments</Typography>
                {sharedComments.length > 0 ? (
                    sharedComments.map(comment => (
                        <Box key={comment.id} sx={{ p: 2, border: '1px solid #ccc', mb: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: "#526D82", color: "white", mr: 2 }}>{comment.displayname[0]}</Avatar>
                                <Box>
                                    <Typography variant="subtitle1">{comment.displayname}</Typography>
                                    <Typography variant="body2" color="textSecondary">{comment.email}</Typography>
                                    {/* <Typography variant="body2" color="textSecondary">{new Date(comment.created_at).toLocaleString()}</Typography> */}
                                </Box>
                            </Box>
                            <Typography variant="body1" sx={{ mb: 1 }}>{comment.comment}</Typography>
                            <Box sx={{ ml: 4 }}>
                                {comment.replies && comment.replies.map(reply => (
                                    <Box key={reply.id} sx={{ mb: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{reply.displayname}:</Typography>
                                        <Typography variant="body2">{reply.reply}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            {/* <Box sx={{ display: 'flex', mt: 2 }}>
                                <TextField
                                    label="Write a reply..."
                                    variant="outlined"
                                    fullWidth
                                    value={newReply}
                                    onChange={handleReplyChange}
                                    sx={{ mr: 2 }}
                                />
                                <Button variant="contained" onClick={() => handleReplySubmit(comment.id)}>Reply</Button>
                            </Box> */}
                        </Box>
                    ))
                ) : (
                    <Typography variant="body2">No comments shared yet.</Typography>
                )}
            </Box>

            <ShareModal
                showModal={showModal}
                handleClose={handleClose}
                innerGroup={innerGroup}
                innerCircleDetails={innerCircleDetails}
                decision={decision}
                id={id}
            />
        </Box>
    );
};

export default View;
