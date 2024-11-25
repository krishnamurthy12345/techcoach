import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardContent, Box, Avatar, Grid, Popover, IconButton, ToggleButton, ButtonGroup, CircularProgress } from '@mui/material';
import { getUserSharedDecisions,postComment } from '../Decision_Circle/Networkk_Call';
import { ToastContainer, toast } from 'react-toastify';
import { Edit as EditIcon } from '@mui/icons-material';
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
            const response = await getUserSharedDecisions();
            console.log('qweerwe', response);
            const sortedDecisions = response.sort((a, b) => {
                const aTimestamp = getRecentCommentTimestamp(a);
                const bTimestamp = getRecentCommentTimestamp(b);
                return new Date(bTimestamp) - new Date(aTimestamp);
            });
            const initialCommentTexts = {};
            setSharedDecisionCircles(response || []);
            sortedDecisions.forEach(item => {
                initialCommentTexts[item.decisionDetails.decision_id] = "";
            });
            setCommentTexts(initialCommentTexts);
        } catch (error) {
            console.error('Error fetching shared decisions:', error);
            // toast.error('An error occurred while fetching shared decision circles');
        } finally {
            setIsLoading(false);
        }
    };

    const getRecentCommentTimestamp = (decision) => {
        if (!decision.decisionDetails || !decision.decisionDetails.creation_date) {
            return null;
        }
        if (!decision.comments || decision.comments.length === 0) {
            return decision.decisionDetails.creation_date;
        }
        const mostRecentComment = decision.comments.reduce((prev, current) => {
            const prevTimestamp = new Date(prev.updated_at || prev.created_at);
            const currentTimestamp = new Date(current.updated_at || current.created_at);
            return prevTimestamp > currentTimestamp ? prev : current;
        });

        return mostRecentComment.updated_at || mostRecentComment.created_at;
    };


    useEffect(() => {
        fetchSharedDecisionCircles();
    }, []);

    const handlePopoverClose = () => {
        setIsPopoverOpen(false);
    };
    
    const handlePostComment = async (decisionId, groupMemberIds) => {
       
        const comment = commentTexts[decisionId]?.trim();
        if (!comment) {
            return toast.error('Comment cannot be empty');
        }
        setButtonLoading((prevState) => ({ ...prevState, [decisionId]: true }));

        try {
            const dataToSend = {
                memberIds: groupMemberIds,
                comment,
                decisionId,
            };
    
            console.log('Posting data:', dataToSend); 
            for (const memberId of groupMemberIds) {
                await postComment(memberId, comment, decisionId);
            }
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


    return (
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
                                                    <Typography variant="body2">
                                                        Group Name : {item.group_name}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Shared By: {item.shared_with_names} | {item.shared_with_emails}
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
                                            {item.comments?.length > 0 ? (
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
                                                        {comment.replies?.length > 0 && (
                                                            <Box mt={1} ml={4} pl={2}>
                                                                {comment.replies.map((reply, replyIndex) => (
                                                                    <Box
                                                                        key={replyIndex} mt={1} mb={1} pl={2} border={1} borderColor="#526D82" padding={2} borderRadius={2} sx={{ backgroundColor: "#DDE6ED" }}>
                                                                        <Grid container spacing={2} alignItems="center">
                                                                            <Grid item>
                                                                                <Avatar
                                                                                    sx={{ bgcolor: "#526D82", color: "white", mr: 2, }} >
                                                                                    {reply.displayname?.[0] || "?"}
                                                                                </Avatar>
                                                                            </Grid>
                                                                            <Grid item xs>
                                                                                <Typography variant="body1">{reply.comment || "No reply provided"}</Typography>
                                                                                <Typography variant="caption" color="textSecondary">
                                                                                    {reply.displayname || "Unknown User"} | {reply.email || "No Email"} |
                                                                                    {reply.created_at === reply.updated_at ? (
                                                                                        <span> {" "} {formatDistanceToNow(parseISO(reply.created_at), { addSuffix: true })} </span>
                                                                                    ) : (
                                                                                        <span> {" "} Edited {formatDistanceToNow(parseISO(reply.updated_at), { addSuffix: true })} </span>
                                                                                    )}
                                                                                </Typography>
                                                                            </Grid>
                                                                        </Grid>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        )}
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
                                                    value={commentTexts[item.decisionDetails?.decision_id] || ""}
                                                    onChange={(e) => handleCommentChange(item.decisionDetails?.decision_id, e.target.value)}
                                                />
                                                <Grid container spacing={2} justifyContent="flex-end">
                                                    <Grid item>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            style={{ marginTop: "1rem" }}
                                                            onClick={() => handlePostComment(item.decisionDetails.decision_id, item.sharedDecision.groupMember, item.sharedDecision.groupId)}
                                                            disabled={
                                                                !commentTexts[item.decisionDetails?.decision_id] ||
                                                                buttonLoading[item.decisionDetails?.decision_id]
                                                            }
                                                        >
                                                            {buttonLoading[item.decisionDetails?.decision_id] ? (
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
    );
};

export default withAuth(SharedDecisionCircle);
