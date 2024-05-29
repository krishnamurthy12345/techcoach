import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Avatar, IconButton, Popover, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { checkInnerCircleExists, getInnerCircleDetails, getSharedComments, postReplyComment, deleteCommentAdded, EditCommentAdded } from '../../Group/Network_Call';
import { useNavigate } from 'react-router-dom';
import ShareModal from '../../Group/ShareModel';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';

const View = () => {
    const [decision, setDecision] = useState({});
    const { id } = useParams();
    const [innerGroup, setInnerGroup] = useState();
    const [showModal, setShowModal] = useState(false);
    const [innerCircleDetails, setInnerCircleDetails] = useState(null);
    const [sharedComments, setSharedComments] = useState([]);
    const [replies, setReplies] = useState({});
    const navigate = useNavigate();

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentContent, setEditedCommentContent] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

    const fetchSharedComments = async () => {
        console.log("decision id", id);
        try {
            const comments = await getSharedComments(id);
            console.log("response from shared comments", comments.comments);
            setSharedComments(comments.comments);
            const initialReplies = comments.comments.reduce((acc, comment) => {
                acc[comment.id] = '';
                return acc;
            }, {});
            setReplies(initialReplies);
        } catch (error) {
            console.error("Failed to fetch shared comments", error);
        }
    };

    useEffect(() => {
        fetchSharedComments();
    }, [id]);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleShare = () => {
        setShowModal(true);
    };

    const handleReplyChange = (commentId) => (event) => {
        setReplies({
            ...replies,
            [commentId]: event.target.value
        });
    };

    const handleReplySubmit = async (commentId, groupId) => {
        try {
            const reply = await postReplyComment(commentId, replies[commentId], groupId, id);
            console.log("response from post reply", reply);
            setReplies({
                ...replies,
                [commentId]: ''
            });
            const comments = await getSharedComments(id);
            setSharedComments(comments.comments);
        } catch (error) {
            console.error("Error submitting reply:", error);
        }
    };

    const handleEdit = (commentId, initialContent) => {
        setEditingCommentId(commentId);
        setEditedCommentContent(initialContent);
        setIsPopoverOpen(true);
    };

    const handleSaveEdit =  async(commentId, editedContent) => {
        console.log(`Save edited comment with id ${commentId} and content: ${editedContent}`);
        try {
            await EditCommentAdded(commentId, editedContent);
            fetchSharedComments();
            toast('Reply edited successfully');
        } catch (error) {
            console.error('Error editing reply:', error);
            toast('An error occurred while editing the reply');
        }
        setEditingCommentId(null);
        setIsPopoverOpen(false);
    };

    const handlePopoverClose = () => {
        setEditingCommentId(null);
        setIsPopoverOpen(false);
    };

    const handleDeleteReply = async (replyId) => {
        console.log("Delete reply", replyId);
        try {
            await deleteCommentAdded(replyId);
            fetchSharedComments();
            toast('Reply deleted successfully');
        } catch (error) {
            console.error('Error deleting reply:', error);
            toast('An error occurred while deleting the reply');
        }
    };

    console.log("shared comments", sharedComments);

    const memberComments = sharedComments.filter(comment => comment.type_of_member === "member");
    const authorComments = sharedComments.filter(comment => comment.type_of_member === "author");

    console.log("is open", isPopoverOpen);

    return (
        <Box sx={{ padding: "1rem", backgroundColor: "white", margin: "2rem", borderRadius: "0.5rem",
            ...(isPopoverOpen && { filter: 'blur(2px)' })
        }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Name:</b> {decision.decision_name}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Details:</b> {decision.user_statement}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Reasons:</b> {decision.decision_reason_text && decision.decision_reason_text.join(', ')}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Due Date:</b> {decision.decision_due_date}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Decision Taken Date:</b> {decision.decision_taken_date}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1"><b>Selected Tags:</b> {decision.tagsArray && decision.tagsArray.join(', ')}</Typography>
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
                {memberComments.length > 0 ? (
                    memberComments.map(memberComment => (
                        <>
                        <Box key={memberComment.id} sx={{ p: 2, border: '1px solid #ccc', mb: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: "#526D82", color: "white", mr: 2 }}>{memberComment.displayname[0]}</Avatar>
                                <Box>
                                    <Typography variant="body1">{memberComment.comment}</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {memberComment.displayname} | {memberComment.email} | 
                                        {memberComment.created_at === memberComment.updated_at
                                            ? " "
                                            : " Edited "}{' '}
                                        {formatDistanceToNow(parseISO(memberComment.created_at), { addSuffix: true })}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Box>
                        {authorComments.map(authorComment => {
                            if (authorComment.parentCommentId === memberComment.id) {
                                return (
                                    <Box key={authorComment.id} sx={{ p: 2, border: '1px solid #ccc', mb: 2, borderRadius: 2, ml: 4, backgroundColor: "#edf6fc" }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Avatar sx={{ bgcolor: "#526D82", color: "white", mr: 2 }}>{authorComment.displayname[0]}</Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1">{authorComment.comment}</Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {authorComment.displayname} | {authorComment.email} |  
                                                    {authorComment.created_at === authorComment.updated_at
                                                        ? <span> {formatDistanceToNow(parseISO(authorComment.created_at), { addSuffix: true })}</span>
                                                        : <span> Edited at {formatDistanceToNow(parseISO(authorComment.updated_at), { addSuffix: true })}</span>}
                                                    
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                                                <IconButton onClick={(e) => { handleEdit(authorComment.id, authorComment.comment); setAnchorEl(e.currentTarget); }}>
                                                    <EditIcon sx={{ color: "black" }} />
                                                </IconButton>
                                                <IconButton onClick={() => handleDeleteReply(authorComment.id)}>
                                                    <DeleteIcon sx={{ color: "red" }} />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            }
                            return null;
                        })}
                        {authorComments.some(authorComment => authorComment.parentCommentId === memberComment.id) ? null : (
                            <Box sx={{ display: 'flex', mt: 2 }}>
                                <input
                                    label="Write a reply..."
                                    variant="outlined"
                                    fullWidth
                                    value={replies[memberComment.id]}
                                    onChange={handleReplyChange(memberComment.id)}
                                    style={{
                                        height: "3rem",
                                        padding: "1rem",
                                        width: "100%",
                                        maxWidth: "100%",
                                        marginRight: "0.5rem"
                                    }}
                                />
                                <Button variant="contained" onClick={() => handleReplySubmit(memberComment.id, memberComment.groupId)}>Reply</Button>
                            </Box>
                        )}

                        </Box>
                        </>
                    ))
                ) : (
                    <Typography variant="body2">No comments shared yet.</Typography>
                )}
            </Box>



            <Popover
                open={isPopoverOpen}
                anchorEl={null}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'center',
                }}
                PaperProps={{
                    sx: {
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        p: 2
                    }
                }}
            >
                <Box>
                    <Typography variant="h6" style={{ marginBottom: "1rem" }}><b>Edit Comment</b></Typography>
                    <TextField
                        multiline
                        fullWidth
                        value={editedCommentContent}
                        onChange={(e) => setEditedCommentContent(e.target.value)}
                    />
                    <Button onClick={() => handleSaveEdit(editingCommentId, editedCommentContent)}>
                        Save
                    </Button>
                </Box>
            </Popover>

            <ShareModal
                showModal={showModal}
                handleClose={handleClose}
                innerGroup={innerGroup}
                innerCircleDetails={innerCircleDetails}
                decision={decision}
                id={id}
            />
            <ToastContainer />
        </Box>
    );
};

export default View;