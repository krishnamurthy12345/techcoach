import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardContent, Box, Avatar, Grid, Popover, IconButton, ToggleButton, ButtonGroup, CircularProgress } from '@mui/material';
import { getdecisionSharedDecisionCirclebyuser,postShareWithComment,getComments } from '../Decision_Circle/Networkk_Call';
import { ToastContainer, toast } from 'react-toastify';
import { Edit as EditIcon } from '@mui/icons-material';
import { Link,useParams } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import withAuth from '../withAuth';

const SharedDecisionCircle = () => {
    const [sharedDecisionCircles, setSharedDecisionCircles] = useState([]);
    const [commentTexts, setCommentTexts] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [showPending, setShowPending] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [buttonLoading, setButtonLoading] = useState({});


    const fetchSharedDecisionCircles = async () => {
        try {
            setIsLoading(true);
            const response = await getdecisionSharedDecisionCirclebyuser();
            console.log('qweerwe', response);
            setSharedDecisionCircles(response || []);
            setCommentTexts({});
        } catch (error) {
            console.error('Error fetching shared decisions:', error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchSharedDecisionCircles();
        fetchComments();    
    }, []);

    const handlePopoverClose = () => {
        setIsPopoverOpen(false);
    };
    
    const handlePostComment = async (decisionId,id) => { 
        const comment = commentTexts[decisionId]?.trim();
        if (!comment) {
            return toast.error('Comment cannot be empty');
        }
        if (!id) {
            return toast.error('Group ID is missing');
        }
        if (!comment) {
            return toast.error('Comment cannot be empty');
        }        
        setButtonLoading((prevState) => ({ ...prevState, [decisionId]: true }));
        try {
            const dataToSend = await postShareWithComment(id,comment, decisionId);
            console.log('Posting data:', dataToSend);
            setCommentTexts((prevState) => ({ ...prevState, [decisionId]: '' }));
            toast.success('Comment posted successfully');
        } catch (error) {
            toast.error('Error posting comment');
            console.error('Error posting comment:', error);
        } finally {
            setButtonLoading((prevState) => ({ ...prevState, [decisionId]: false }));
        }
    };

      const filteredDecisions = sharedDecisionCircles.filter(item =>
        (!showPending || !item.decision_taken_date) &&
        (selectedUser ? item.shared_by_email === selectedUser.email : true)
    );

    const handleCommentChange = (decisionId, newText) => {
        setCommentTexts(prevState => ({
            ...prevState,
            [decisionId]: newText
        }));
    };

    const fetchComments = async (groupId, decisionId) => {
        try {
            const response = await getComments(groupId, decisionId);
            setCommentTexts((prevComments) => ({
                ...prevComments,
                [decisionId]: response || [],
            }));
            console.log('babababa', response);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    return (
        <div>
            <div className='ml-5'>
                <Link to='/sharedDecisions'>
                <button>Go Back</button>
                </Link>
            </div>
        <Box p={3}>
            <h2>Decision Circle Decisions:</h2>
            {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {sharedDecisionCircles.length === 0 ? (
                        <Typography variant="h5" align="center" mt={2} mb={2}>
                            No shared decisions
                        </Typography>
                    ) : (
                        <>
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
                                        backgroundColor: !showPending ? '#3F5362' : 'default',
                                        height: "3rem",
                                        '&:hover': {
                                            color: !showPending ? '#fff' : '#000',
                                            backgroundColor: !showPending ? '#465e70' : 'default'
                                        },
                                    }}
                                >
                                    Show All Decisions
                                </ToggleButton>        
                            </ButtonGroup>
                            {filteredDecisions.length === 0 ? (
                                <Typography variant="h5" align="center" mt={2} mb={2}>
                                    {showPending ? 'No pending decisions' : 'No decisions found'}
                                </Typography>
                            ) : (
                                filteredDecisions.map((item, index) => (
                                    <Card key={index} variant="outlined" style={{ margin: "1rem" }}>
                                        <CardContent>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item>
                                                    <Avatar sx={{ bgcolor: "#526D82", color: "white" }}>
                                                        {item.shared_by[0]}
                                                    </Avatar>
                                                </Grid>
                                                <Grid item xs>
                                                    <Typography variant="h6">
                                                        Decision: {item.decision_name}
                                                    </Typography>
                                                    {/* <Typography variant="body2">
                                                        groupId: {item.id}
                                                    </Typography> */}
                                                    <Typography variant="body2">
                                                        Group Name : {item.group_name}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Shared By: {item.shared_by} | {item.shared_by_email}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                            <Typography variant="body1" mt={2}>
                                                Reasons:
                                            </Typography>
                                            {item.reasons && item.reasons.length > 0 ? (
                                                item.reasons.map((reason, reasonIndex) => (
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
                                                Due Date: {item.decision_due_date ? new Date(item.decision_due_date).toLocaleDateString() : 'N/A'}
                                            </Typography>
                                            {item.decision_taken_date && (
                                                <Typography variant="body1">
                                                    Taken Date: {new Date(item.decision_taken_date).toLocaleDateString()}
                                                </Typography>
                                            )}
                                            <Typography variant="body1" color="textSecondary">
                                                User Statement: {item.user_statement}
                                            </Typography>
                                        </CardContent>
                                        <CardContent>
                                            <Typography variant="h6">Comments:</Typography>
                                            {item.comments && item.comments.length > 0 ? (
                                                item.comments.map((comment, commentIndex) => (
                                                    <Box key={commentIndex} mt={2} mb={2}>
                                                        <Grid container spacing={2} alignItems="center">
                                                            <Grid item>
                                                                <Avatar sx={{ bgcolor: "#526D82", color: "white" }}>{comment.displayname?.[0] || "?"}</Avatar>
                                                            </Grid>
                                                            <Grid item xs>
                                                                <Typography variant="body1">{comment.comment || "No comment provided"}</Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {comment.displayname || "Unknown User"} | {comment.email || "No Email"} |
                                                                    {comment.created_at === comment.updated_at ? (
                                                                        <span>
                                                                            {" "}
                                                                            {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}
                                                                        </span>
                                                                    ) : (
                                                                        <span>
                                                                            {" "}
                                                                            Edited {formatDistanceToNow(parseISO(comment.updated_at), { addSuffix: true })}
                                                                        </span>
                                                                    )}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item>
                                                                <IconButton >
                                                                    <EditIcon sx={{ color: "black" }} />
                                                                </IconButton>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="textSecondary">
                                                    No comments available.
                                                </Typography>
                                            )}
                                            <Box mt={2}>
                                                <input
                                                    label="Add Comment" variant="outlined" fullWidth placeholder="Add a comment..."
                                                    style={{
                                                        height: "3rem", padding: "1rem", width: "100%", maxWidth: "100%", marginRight: "0.5rem",
                                                    }}
                                                    value={commentTexts[item.decision_id] || ""}
                                                    onChange={(e) => handleCommentChange(item.decision_id, e.target.value)}
                                                />
                                                <Grid container spacing={2} justifyContent="flex-end">
                                                    <Grid item>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            style={{ marginTop: "1rem" }}
                                                            onClick={() => handlePostComment(item.decision_id,item.id)}
                                                            disabled={
                                                                !commentTexts[item.decision_id] ||
                                                                buttonLoading[item.decision_id]
                                                            }
                                                        >
                                                            {buttonLoading[item.decision_id] ? (
                                                                <CircularProgress size={24} />
                                                            ) : (
                                                                "Save"
                                                            )}
                                                        </Button>
                                                    </Grid>
                                                    
                                                </Grid>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </>
                    )}
                </>
            )}
            <Popover
                open={isPopoverOpen}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'top', horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top', horizontal: 'center',
                }}
            />
            <ToastContainer />
        </Box>
        </div>
    );
};

export default withAuth(SharedDecisionCircle);
