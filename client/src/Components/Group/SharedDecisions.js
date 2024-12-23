import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardContent, Box, Avatar, IconButton, Grid, Popover, ToggleButton, ButtonGroup, CircularProgress } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { getSharedDecisions, postCommentForDecision, deleteCommentAdded, EditCommentAdded, innerCirclePostComment } from '../../Components/Group/Network_Call';
import { ToastContainer, toast } from 'react-toastify';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import withAuth from '../withAuth';
import './SharedDecision.css';

const SharedDecision = () => {
    const [sharedDecisions, setSharedDecisions] = useState([]);
    const [commentTexts, setCommentTexts] = useState({});
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentContent, setEditedCommentContent] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [showPending, setShowPending] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [autocompleteValue, setAutocompleteValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [buttonLoading, setButtonLoading] = useState({});
    

    const fetchSharedDecisions = async () => {
        try {
            const response = await getSharedDecisions();
            console.log("responseeee", response);
            const sortedDecisions = response.sort((a, b) => {
                const aTimestamp = getRecentCommentTimestamp(a);
                const bTimestamp = getRecentCommentTimestamp(b);
                return new Date(bTimestamp) - new Date(aTimestamp);
            });
            setSharedDecisions(sortedDecisions);
            const initialCommentTexts = {};
            sortedDecisions.forEach(item => {
                initialCommentTexts[item.decisionDetails.decision_id] = "";
            });
            setCommentTexts(initialCommentTexts);
            setLoading(false);  // Set loading to false once data is fetched
        } catch (error) {
            console.error('Error fetching shared decisions:', error);
            toast('An error occurred while fetching shared decisions');
            setLoading(false);  // Set loading to false even if there's an error
        }
    };

    const getRecentCommentTimestamp = (decision) => {
        if (!decision.comments || decision.comments.length === 0) return decision.decisionDetails.creation_date;
        const mostRecentComment = decision.comments.reduce((prev, current) => {
            const prevTimestamp = new Date(prev.updated_at || prev.created_at);
            const currentTimestamp = new Date(current.updated_at || current.created_at);
            return prevTimestamp > currentTimestamp ? prev : current;
        });
        return mostRecentComment.updated_at || mostRecentComment.created_at;
    };

    useEffect(() => {
        fetchSharedDecisions();
    }, []);

    const handlePostComment = async (decisionId, groupMemberID, groupId) => {
        try {
            setButtonLoading(prevState => ({ ...prevState, [decisionId]: true })); // Set loading to true
            const commentText = commentTexts[decisionId];
            const response = await postCommentForDecision(decisionId, groupMemberID, commentText, groupId);
            fetchSharedDecisions();

            if (response.status === 200) {
                toast('Comment posted successfully');
                setCommentTexts(prevState => ({
                    ...prevState,
                    [decisionId]: ""
                }));
            } else {
                toast('Failed to post the comment');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            toast('An error occurred while posting the comment');
        } finally {
            setButtonLoading(prevState => ({ ...prevState, [decisionId]: false })); 
        }
    };

    const handlePostCommentAndEmail = async (decisionId, groupMemberID, groupId, email) => {
        try {
            setButtonLoading(prevState => ({ ...prevState, [decisionId + '_email']: true }));
            await handlePostComment(decisionId, groupMemberID, groupId);
            const responseToPostComment = await innerCirclePostComment(sharedDecisions.find(decision => decision.decisionDetails.decision_id === decisionId).decisionDetails, groupMemberID, commentTexts[decisionId], email);
            console.log("response from the responseToPostComment", responseToPostComment);
        } catch (error) {
            console.error('Error posting comment and emailing:', error);
        } finally {
            setButtonLoading(prevState => ({ ...prevState, [decisionId + '_email']: false })); 
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

    const getUniqueUsers = (decisions, showPending) => {
        const users = [];
        const emails = new Set();

        decisions.forEach(decision => {
            if ((!showPending || !decision.decisionDetails.decision_taken_date)) {
                const user = decision.decisionDetails.userDetails;
                if (!emails.has(user.email)) {
                    emails.add(user.email);
                    users.push(user);
                }
            }
        });

        return users;
    };

    const handleAutocompleteChange = (event) => {
        setAutocompleteValue(event.target.value);
        const selected = getUniqueUsers(sharedDecisions).find(user => `${user.displayname} (${user.email})` === event.target.value);
        setSelectedUser(selected);
    };

    return (
    <>
        <div className='sharedDecision-button'>
            <button className='sharedDecision-inner'>
                Inner Circle Decisions 
            </button>
            <Link to='/sharedDecisionCircle'>
            <button className='sharedDecision-decision'>
                Decision Circle Decisions
            </button>
            </Link>
        </div>
        <Box p={3}>
            <h2>Inner Circle Decisions:</h2>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {sharedDecisions.length === 0 ? (
                        <Typography variant="h5" align="center" mt={2} mb={2}>
                            No shared decisions
                        </Typography>
                    ) : (
                        <div style={{ ...(isPopoverOpen && { filter: 'blur(2px)' }) }}>
                            <ButtonGroup
                                sx={{
                                    marginBottom: "1rem",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "0.5rem",
                                    margin: "1rem",
                                    flexDirection: { xs: 'column', sm: 'row' }
                                }}
                            >
                                <ToggleButton
                                    value={true}
                                    selected={showPending}
                                    onClick={() => setShowPending(true)}
                                    sx={{
                                        color: showPending ? '#fff' : '#000',
                                        border: showPending ? "0.12rem solid #3F5362" : "0.1rem solid #3F5362",
                                        backgroundColor: showPending ? '#3F5362' : 'default',
                                        height: "3rem",
                                        '&:hover': {
                                            color: showPending ? '#fff' : '#000',
                                            backgroundColor: showPending ? '#465e70' : 'default'
                                        },
                                    }}
                                >
                                    Show Pending Decisions
                                </ToggleButton>
                                <ToggleButton
                                    value={false}
                                    selected={!showPending}
                                    onClick={() => setShowPending(false)}
                                    sx={{
                                        color: !showPending ? '#fff' : '#000',
                                        border: !showPending ? "0.12rem solid #3F5362" : "0.1rem solid #3F5362",
                                        backgroundColor: !showPending ? '#465e70' : 'default',
                                        height: "3rem",
                                        '&:hover': {
                                            color: !showPending ? '#fff' : '#000',
                                            backgroundColor: !showPending ? '#465e70' : 'default'
                                        },
                                    }}
                                >
                                    Show All Decisions
                                </ToggleButton>

                                <select
                                    value={autocompleteValue}
                                    onChange={handleAutocompleteChange}
                                    style={{
                                        width: '100%',
                                        borderRadius: '0.3rem',
                                        border: '0.1rem solid #3F5362',
                                        maxWidth: '300px',
                                        marginTop: "0",
                                        padding: "0.7rem",
                                        '@media (maxWidth: 600px)': {
                                            maxWidth: '100%',
                                        }
                                    }}
                                >
                                    <option value="">Sort by Name</option>
                                    {getUniqueUsers(sharedDecisions, showPending).map((user, index) => (
                                        <option key={index} value={`${user.displayname} (${user.email})`}>
                                            {user.displayname} ({user.email})
                                        </option>
                                    ))}
                                </select>

                            </ButtonGroup>
                            <div>
                                {sharedDecisions
                                    .filter(item =>
                                        (!showPending || !item.decisionDetails.decision_taken_date) &&
                                        (selectedUser ? item.decisionDetails.userDetails.email === selectedUser.email : true)
                                    )
                                    .map((item, index) => (
                                        <div key={index}>
                                            <Card variant="outlined" mt={2} mb={2} style={{ margin: "1rem" }}>
                                                <CardContent>
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid item>
                                                            <Avatar sx={{ bgcolor: "#526D82", color: "white" }}>{item.decisionDetails.userDetails.displayname[0]}</Avatar>
                                                        </Grid>
                                                        <Grid item xs>
                                                            <Typography variant="h6">
                                                                Decision: {item.decisionDetails.decision_name}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {item.decisionDetails.userDetails.displayname} | {item.decisionDetails.userDetails.email}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                    <Typography variant="body1" mt={2}>
                                                        Reasons:
                                                    </Typography>
                                                    {item.decisionDetails.reasons && item.decisionDetails.reasons.length > 0 ? (
                                                        item.decisionDetails.reasons.map((reason, reasonIndex) => (
                                                            <Typography key={reasonIndex} variant="body1" style={{ marginLeft: '16px' }}>
                                                                - {reason}
                                                            </Typography>
                                                        ))
                                                    ) : (
                                                        <Typography variant="body1" style={{ marginLeft: '16px' }}>
                                                            No reasons provided
                                                        </Typography>
                                                    )}
                                                    <Typography variant="body1">
                                                        Due Date: {new Date(item.decisionDetails.decision_due_date).toLocaleDateString()}
                                                    </Typography>
                                                    {item.decisionDetails.decision_taken_date ? (
                                                        <Typography variant="body1">
                                                            Taken Date: {new Date(item.decisionDetails.decision_taken_date).toLocaleDateString()}
                                                        </Typography>
                                                    ) : (
                                                        <></>
                                                    )}
                                                    <Typography variant="body1" color="textSecondary">
                                                        User Statement: {item.decisionDetails.user_statement}
                                                    </Typography>
                                                </CardContent>
                                                <CardContent>
                                                    <Typography variant="h6">Comments:</Typography>
                                                    {item.comments.map((comment, commentIndex) => (
                                                        <Box key={commentIndex} mt={2} mb={2}>
                                                            <Grid container spacing={2} alignItems="center">
                                                                <Grid item>
                                                                    <Avatar sx={{ bgcolor: "#526D82", color: "white" }}>{comment.displayname[0]}</Avatar>
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
                                                                </Grid>
                                                            </Grid>
                                                            {comment.replies && comment.replies.length > 0 && (
                                                                <Box mt={1} ml={4} pl={2}>
                                                                    {comment.replies.map((reply, replyIndex) => (
                                                                        <Box key={replyIndex} mt={1} mb={1} pl={2} border={1} borderColor="#526D82" padding={2} borderRadius={2} sx={{ backgroundColor: "#DDE6ED" }}>
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
                                                            fullWidth='true'
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
                                                        <Grid container spacing={2} justifyContent="flex-end">
                                                            <Grid item>
                                                                <Button
                                                                    variant="contained"
                                                                    color="primary"
                                                                    onClick={() => handlePostComment(item.decisionDetails.decision_id, item.sharedDecision.groupMember, item.sharedDecision.groupId)}
                                                                    style={{ marginTop: "1rem" }}
                                                                    disabled={!commentTexts[item.decisionDetails.decision_id] || buttonLoading[item.decisionDetails.decision_id]} 
                                                                >
                                                                    {buttonLoading[item.decisionDetails.decision_id] ? <CircularProgress size={24} /> : 'Save'}
                                                                </Button>
                                                            </Grid>
                                                            <Grid item>
                                                                <Button
                                                                    variant="contained"
                                                                    color="primary"
                                                                    onClick={async () => {
                                                                        const email = item.decisionDetails.userDetails.email;
                                                                        await handlePostCommentAndEmail(item.decisionDetails.decision_id, item.sharedDecision.groupMember, item.sharedDecision.groupId, email);
                                                                    }}
                                                                    style={{ marginTop: "1rem" }}
                                                                    disabled={!commentTexts[item.decisionDetails.decision_id] || buttonLoading[item.decisionDetails.decision_id + '_email']} 
                                                                >
                                                                    {buttonLoading[item.decisionDetails.decision_id + '_email'] ? <CircularProgress size={24} /> : 'Save and Email'}
                                                                </Button>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                {showPending && !sharedDecisions.some(item => !item.decisionDetails.decision_taken_date) && (
                                    <Typography variant="h5" align="center" mt={2} mb={2} sx={{
                                        backgroundColor: "white",
                                        padding: "0.5rem",
                                        borderRadius: "0.2rem"
                                    }}>
                                        No pending decisions
                                    </Typography>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
            <Popover
                open={isPopoverOpen}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box p={2}>
                    <Typography variant="h6">Edit Comment</Typography>
                    <input
                        fullWidth
                        variant="outlined"
                        value={editedCommentContent}
                        onChange={(e) => setEditedCommentContent(e.target.value)}
                        style={{
                            height: "3rem",
                            padding: "1rem",
                            width: "100%",
                            maxWidth: "100%",
                            marginRight: "0.5rem"
                        }}
                    />
                    <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button onClick={handlePopoverClose} style={{ marginRight: '8px' }}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleSaveEdit(editingCommentId, editedCommentContent)}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            </Popover>
            <ToastContainer />
        </Box>
</>
    );
};

export default withAuth(SharedDecision);
