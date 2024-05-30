import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardContent, Box, Avatar, IconButton, TextField, Grid, Popover } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getSharedDecisions, postCommentForDecision, deleteCommentAdded, EditCommentAdded } from '../../Components/Group/Network_Call';
import { ToastContainer, toast } from 'react-toastify';
import { formatDistanceToNow, parseISO } from 'date-fns';

const SharedDecision = () => {
    const [sharedDecisions, setSharedDecisions] = useState([]);
    const [commentTexts, setCommentTexts] = useState({});
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentContent, setEditedCommentContent] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const fetchSharedDecisions = async () => {
        try {
            const response = await getSharedDecisions();
            setSharedDecisions(response);
            const initialCommentTexts = {};
            response.forEach(item => {
                initialCommentTexts[item.decisionDetails.decision_id] = "";
            });
            setCommentTexts(initialCommentTexts);
        } catch (error) {
            console.error('Error fetching shared decisions:', error);
            toast('An error occurred while fetching shared decisions');
        }
    };

    useEffect(() => {
        fetchSharedDecisions();
    }, []);

    const handlePostComment = async (decisionId, groupMemberID, groupId) => {
        try {
            const commentText = commentTexts[decisionId];
            await postCommentForDecision(decisionId, groupMemberID, commentText, groupId);
            fetchSharedDecisions();
            toast('Comment posted successfully');
            setCommentTexts(prevState => ({
                ...prevState,
                [decisionId]: ""
            }));
        } catch (error) {
            console.error('Error posting comment:', error);
            toast('An error occurred while posting the comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteCommentAdded(commentId);
            fetchSharedDecisions();
            toast('Comment deleted successfully');
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast('An error occurred while deleting the comment');
        }
    };

    const handleCommentChange = (decisionId, newText) => {
        setCommentTexts(prevState => ({
            ...prevState,
            [decisionId]: newText
        }));
    };

    const handleEdit = (commentId, initialContent) => {
        setEditingCommentId(commentId);
        setEditedCommentContent(initialContent);
        setIsPopoverOpen(true);
    };

    const handleSaveEdit = async (commentId, editedContent) => {
        console.log(`Save edited comment with id ${commentId} and content: ${editedContent}`);
        try {
            await EditCommentAdded(commentId, editedContent);
            fetchSharedDecisions();
            toast('Comment edited successfully');
        } catch (error) {
            console.error('Error editing comment:', error);
            toast('An error occurred while editing the comment');
        }
        setEditingCommentId(null);
        setIsPopoverOpen(false);
    };

    const handlePopoverClose = () => {
        setEditingCommentId(null);
        setIsPopoverOpen(false);
    };

    console.log("sharedDecisions", sharedDecisions);

    return (
        <Box p={3} style={{ ...(isPopoverOpen && { filter: 'blur(2px)' })}}>
            {sharedDecisions.length === 0 ? (
                <Typography variant="h5" align="center" mt={2} mb={2}>
                    No shared decisions
                </Typography>
            ) : (
                sharedDecisions.map((item, index) => (
                    <Card key={index} variant="outlined" mt={2} mb={2} style={{ margin: "1rem" }}>
                        <CardContent>
                            <Typography variant="h6">
                                Decision: {item.decisionDetails.decision_name}
                            </Typography>
                            <Typography variant="body2">
                                Reasons:
                            </Typography>
                            {item.decisionDetails.reasons && item.decisionDetails.reasons.length > 0 ? (
                                item.decisionDetails.reasons.map((reason, reasonIndex) => (
                                    <Typography key={reasonIndex} variant="body2" style={{ marginLeft: '16px' }}>
                                        - {reason}
                                    </Typography>
                                ))
                            ) : (
                                <Typography variant="body2" style={{ marginLeft: '16px' }}>
                                    No reasons provided
                                </Typography>
                            )}
                            <Typography variant="body2">
                                Due Date: {new Date(item.decisionDetails.decision_due_date).toLocaleDateString()}
                            </Typography>
                            {item.decisionDetails.decision_taken_date ? (
                                <Typography variant="body2">
                                    Taken Date: {new Date(item.decisionDetails.decision_taken_date).toLocaleDateString()}
                                </Typography>
                            ) : (
                                <></>
                            )}
                            <Typography variant="body2" color="textSecondary">
                                User Statement: {item.decisionDetails.user_statement}
                            </Typography>
                        </CardContent>
                        <CardContent>
                            <Typography variant="h6">Comments:</Typography>
                            {item.comments.map((comment, commentIndex) => (
                                <Box key={commentIndex} mt={2} mb={2}>
                                    <Grid container spacing={2} alignItems="center" >
                                        <Grid item>
                                            <Avatar sx={{ bgcolor: "#526D82", color: "white", mr: 2 }}>{comment.displayname[0]}</Avatar>
                                        </Grid>
                                        <Grid item xs>
                                            <Typography variant="body1">{comment.comment}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {comment.displayname} | {comment.email} |  
                                                {comment.created_at === comment.updated_at
                                                                    ? <span> {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}</span>
                                                                    : <span> Edited {formatDistanceToNow(parseISO(comment.updated_at), { addSuffix: true })}</span>}
                                                    
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <IconButton onClick={() => handleEdit(comment.id, comment.comment)}>
                                                <EditIcon sx={{ color: "black" }} />
                                            </IconButton>
                                            {/* <IconButton onClick={() => handleDeleteComment(comment.id)}>
                                                <DeleteIcon style={{ color: "red" }} />
                                            </IconButton> */}
                                        </Grid>
                                    </Grid>
                                    {comment.replies && comment.replies.length > 0 && (
                                        <Box mt={1} ml={4} pl={2}>
                                            {comment.replies.map((reply, replyIndex) => (
                                                <Box key={replyIndex} mt={1} mb={1} pl={2} border={1} borderColor="#526D82" padding={2} borderRadius={2} sx={{backgroundColor:"#DDE6ED"}}>
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid item>
                                                            <Avatar sx={{ bgcolor: "#526D82", color: "white", mr: 2 }}>{reply.displayname[0]}</Avatar>
                                                        </Grid>
                                                        <Grid item xs>
                                                            <Typography variant="body1">{reply.comment}</Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {reply.displayname} | {reply.email} | 
                                                                {reply.created_at === reply.updated_at
                                                                    ? <span> {formatDistanceToNow(parseISO(reply.created_at), { addSuffix: true })}</span>
                                                                    : <span> Edited {formatDistanceToNow(parseISO(reply.updated_at), { addSuffix: true })}</span>}
                                                    
                                                                </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            ))}
                            <Box mt={2}>
                                <input
                                    label="Add Comment"
                                    variant="outlined"
                                    fullWidth
                                    placeholder="Add a comment..."
                                    style={{
                                        height: "3rem",
                                        padding: "1rem",
                                        width: "100%",
                                        maxWidth: "100%",
                                        marginRight: "0.5rem"
                                    }}
                                    value={commentTexts[item.decisionDetails.decision_id]}
                                    onChange={(e) => handleCommentChange(item.decisionDetails.decision_id, e.target.value)}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handlePostComment(item.decisionDetails.decision_id, item.sharedDecision.groupMember, item.sharedDecision.groupId)}
                                    style={{ marginTop: '8px' }}
                                >
                                    Add Comment
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}

            <Popover
                open={isPopoverOpen}
                anchorEl={null}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'left',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'left',
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
            <ToastContainer />
        </Box>
    );
};

export default SharedDecision;
