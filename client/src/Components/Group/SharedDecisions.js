import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardContent, Box } from '@mui/material';
import { getSharedDecisions, postCommentForDecision } from '../../Components/Group/Network_Call';
import { ToastContainer, toast } from 'react-toastify';

const SharedDecision = () => {
    const [sharedDecisions, setSharedDecisions] = useState([]);
    const [commentTexts, setCommentTexts] = useState({});

    const fetchSharedDecisions = async () => {
        try {
            const response = await getSharedDecisions();

            console.log("Response from shared decisions:", response);
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

    const handleCommentChange = (decisionId, newText) => {
        setCommentTexts(prevState => ({
            ...prevState,
            [decisionId]: newText
        }));
    };

    return (
        <div style={{ margin: "3rem" }}>
            {sharedDecisions.length === 0 ? (
                <Typography variant="h5" style={{ textAlign: "center", marginTop: "1rem", backgroundColor: "aliceblue", padding: "1rem" }}>
                    No shared decisions
                </Typography>
            ) : (
                sharedDecisions.map((item, index) => (
                    <div key={index} style={{margin:"3rem"}}>
                        <Card variant="outlined" style={{ marginBottom: '10px' }}>
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
                                <Typography variant="body2">
                                    Taken Date: {new Date(item.decisionDetails.decision_taken_date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    User Statement: {item.decisionDetails.user_statement}
                                </Typography>
                            </CardContent>
                        </Card>
                        {item.comments[0].comment != "" && item.comments.length > 0 ? (
                            <Box ml={8} mt={2} mb={2} p={2} bgcolor="#ffffff" borderRadius={3}>
                                <Typography variant="h6">Comments:</Typography>
                                {item.comments.map((comment, commentIndex) => (
                                    <Typography key={commentIndex} variant="body2" style={{ marginTop: '8px' }}>
                                        {comment.comment}
                                    </Typography>
                                ))}
                            </Box>
                        ) : (
                            <Box ml={8} mt={2} display="flex" alignItems="center">
                                <input
                                    label="Add Comment"
                                    variant="outlined"
                                    fullWidth
                                    placeholder="Add a comment..."
                                    value={commentTexts[item.decisionDetails.decision_id]}
                                    onChange={(e) => handleCommentChange(item.decisionDetails.decision_id, e.target.value)}
                                    style={{
                                        flex: 1,
                                        height: "3rem",
                                        padding: "1rem",
                                        marginRight: "1rem",
                                        width: "100%",
                                        maxWidth: "100%"
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handlePostComment(item.decisionDetails.decision_id, item.sharedDecision.groupMember, item.sharedDecision.groupId)}
                                >
                                    Add Comment
                                </Button>
                            </Box>
                        )}
                    </div>
                ))
            )}
            <ToastContainer />
        </div>
    );
};

export default SharedDecision;
