import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardContent, Modal, TextField, Box, Avatar, Grid, Popover, ToggleButton, ButtonGroup, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { getdecisionSharedDecisionCirclebyuser, postShareWithComment,editComments } from '../Decision_Circle/Networkk_Call';
import { ToastContainer, toast } from 'react-toastify';
import { AiFillEdit } from "react-icons/ai";
import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import withAuth from '../withAuth';
import axios from 'axios';

const SharedDecisionCircle = () => {
    const [sharedDecisionCircles, setSharedDecisionCircles] = useState([]);
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [showPending, setShowPending] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [buttonLoading, setButtonLoading] = useState({});
    const [editComment, setEditComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [isEditModalOpen, setEditModalOpen] = useState(false);




    const fetchSharedDecisionCircles = async () => {
        try {
            setIsLoading(true);
            const response = await getdecisionSharedDecisionCirclebyuser();
            console.log('qweerwe', response);
            setSharedDecisionCircles(response || []);
            setComments({});
        } catch (error) {
            console.error('Error fetching shared decisions:', error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchSharedDecisionCircles();
    }, []);

    const handlePopoverClose = () => {
        setIsPopoverOpen(false);
    };

    const handlePostComment = async (decisionId, id) => {
        const comment = comments[decisionId]?.trim();
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
            const dataToSend = await postShareWithComment(id, comment, decisionId);
            console.log('Posting data:', dataToSend);
            setComments((prevState) => ({ ...prevState, [decisionId]: '' }));
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
        setComments(prevState => ({
            ...prevState,
            [decisionId]: newText
        }));
    };

    const handleInputChange = (decisionId, value) => {
        setNewComment((prevNewComment) => ({
            ...prevNewComment,
            [decisionId]: value,
        }));
    };
    
    const fetchComments = async (groupId, decisionId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/comment?groupId=${groupId}&decisionId=${decisionId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            console.log('Fetched comments:', response.data.comments);

            setComments((prevComments) => ({
                ...prevComments,
                [decisionId]: Array.isArray(response.data.comments) ? response.data.comments : [],
            }));
        } catch (error) {
            console.error('Error fetching comments:', error.response?.data || error.message);
            setComments((prevComments) => ({
                ...prevComments,
                [decisionId]: [],
            }));
        }
    };

    useEffect(() => {
        sharedDecisionCircles.forEach((item) => {
            fetchComments(item.id, item.decision_id);
        });
    }, [sharedDecisionCircles]);

    const handleEditClick = (commentId) => {
        setEditComment(commentId.id);
        setEditContent(commentId.comment);
        setEditModalOpen(true);
    }

    const handleSaveEditComment = async () => {
        try {
            const updatedComment = { comment: editContent };
            await editComments(editComment, updatedComment);
            toast.success('Comment Updated successfully');
            fetchComments();
            setEditModalOpen(false);
            setEditComment(null);
            setEditContent('')
        } catch (error) {
            console.error('Failed to update comment:', error);
            toast.error('Failed to update comment');
        } finally {
            setEditModalOpen(false);
        }
    }

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
                                                <List>
                                                    {Array.isArray(comments[item.decision_id]) &&
                                                        comments[item.decision_id].map((comment) => (
                                                            <ListItem key={comment.commentId} alignItems="flex-start">
                                                                <ListItemText
                                                                    primary={comment.comment}
                                                                    secondary={
                                                                        <Box
                                                                            className="comment-content"
                                                                            style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}
                                                                        >
                                                                            <Avatar
                                                                                sx={{ bgcolor: "#526D82", color: "white", marginRight: 2 }}
                                                                            >
                                                                                {comment.displayname ? comment.displayname[0] : "?"}
                                                                            </Avatar>
                                                                            <div style={{ flex: 1 }}>
                                                                                <Typography variant="caption">
                                                                                    {comment.displayname || "Unknown User"} | {comment.email || "No Email"} | {" "}
                                                                                    {comment.created_at === comment.updated_at ? (
                                                                                        <span>
                                                                                            {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span>
                                                                                            Edited {formatDistanceToNow(parseISO(comment.updated_at), { addSuffix: true })}
                                                                                        </span>
                                                                                    )}
                                                                                </Typography>
                                                                            </div>
                                                                            {comment.type_of_member === 'member' && (
                                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                                                    <AiFillEdit
                                                                                        style={{ marginRight: '8px', cursor: 'pointer', fontSize: '22px' }}
                                                                                        onClick={() => handleEditClick(comment)}
                                                                                    />
                                                                                    {/* <MdOutlineDeleteForever
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleDeleteComment(comment.id, item.decision_id)}
                                        /> */}
                                                                                </div>
                                                                            )}
                                                                        </Box>
                                                                    }
                                                                />
                                                            </ListItem>
                                                        ))}
                                                </List>
                                                <Box mt={2}>
                                                    <input
                                                        type="text"
                                                        placeholder="Add a comment..."
                                                        style={{
                                                            height: "3rem",
                                                            padding: "1rem",
                                                            width: "100%",
                                                            marginRight: "0.5rem",
                                                        }}
                                                        value={comments[item.decision_id] || ""}
                                                        onChange={(e) => handleCommentChange(item.decision_id, e.target.value)}
                                                    />
                                                    <Grid container spacing={2} justifyContent="flex-end">
                                                        <Grid item>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                style={{ marginTop: "1rem" }}
                                                                onClick={() => handlePostComment(item.decision_id, item.id)}
                                                                disabled={
                                                                    !comments[item.decision_id] || buttonLoading[item.decision_id]
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
                <Modal open={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                    <Typography variant="h6" mb={2}>Edit Comment</Typography>
                    <TextField fullWidth multiline rows={4} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                    <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                        <Button variant="contained" color="primary" onClick={handleSaveEditComment}>Save</Button>
                        <Button variant="outlined" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                    </Box>
                </Box>
            </Modal>
                <ToastContainer />
            </Box>
        </div>
    );
};

export default withAuth(SharedDecisionCircle);




// import React, { useEffect, useState } from 'react';
// import { Button, Typography, Card, CardContent, Box, Avatar, Grid, Popover, IconButton, ToggleButton, ButtonGroup, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
// import { getdecisionSharedDecisionCirclebyuser, postShareWithComment } from '../Decision_Circle/Networkk_Call';
// import { ToastContainer, toast } from 'react-toastify';
// import { Link } from 'react-router-dom';
// import { formatDistanceToNow, parseISO } from 'date-fns';
// import withAuth from '../withAuth';
// import axios from 'axios';

// const SharedDecisionCircle = () => {
//     const [sharedDecisionCircles, setSharedDecisionCircles] = useState([]);
//     const [comments, setComments] = useState({});
//     const [newComment, setNewComment] = useState({});
//     const [isLoading, setIsLoading] = useState(true);
//     const [anchorEl, setAnchorEl] = useState(null);
//     const [isPopoverOpen, setIsPopoverOpen] = useState(false);
//     const [showPending, setShowPending] = useState(true);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [buttonLoading, setButtonLoading] = useState({});


//     const fetchSharedDecisionCircles = async () => {
//         try {
//             setIsLoading(true);
//             const response = await getdecisionSharedDecisionCirclebyuser();
//             console.log('qweerwe', response);
//             setSharedDecisionCircles(response || []);
//             setComments({});
//         } catch (error) {
//             console.error('Error fetching shared decisions:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };


//     useEffect(() => {
//         fetchSharedDecisionCircles();
//     }, []);

//     const handlePopoverClose = () => {
//         setIsPopoverOpen(false);
//     };

//     const handlePostComment = async (decisionId, id) => {
//         const comment = newComment[decisionId]?.trim();
//         if (!comment || !id) {
//             return toast.error('Please provide all required details.');
//         }
//         setButtonLoading((prevState) => ({ ...prevState, [decisionId]: true }));
//         try {
//             const dataToSend = await postShareWithComment(id, comment, decisionId);
//             console.log('Posting data:', dataToSend);
//             setNewComment((prevState) => ({ ...prevState, [decisionId]: '' }));
//             toast.success('Comment posted successfully');
//             fetchComments(id,decisionId);
//         } catch (error) {
//             toast.error('Error posting comment');
//             console.error('Error posting comment:', error);
//         } finally {
//             setButtonLoading((prevState) => ({ ...prevState, [decisionId]: false }));
//         }
//     };

//     const filteredDecisions = sharedDecisionCircles.filter(item =>
//         (!showPending || !item.decision_taken_date) &&
//         (selectedUser ? item.shared_by_email === selectedUser.email : true)
//     );

//     const handleCommentChange = (decisionId, value) => {
//         setComments(prevState => ({
//             ...prevState,
//             [decisionId]: value
//         }));
//     };

//     const fetchComments = async (groupId, decisionId) => {
//         try {
//             const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/comment?groupId=${groupId}&decisionId=${decisionId}`, {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('token')}`,
//                 },
//             });

//             console.log('Fetched comments:', response.data.comments);

//             setComments((prevComments) => ({
//                 ...prevComments,
//                 [decisionId]: Array.isArray(response.data.comments) ? response.data.comments : [],
//             }));
//         } catch (error) {
//             console.error('Error fetching comments:', error.response?.data || error.message);
//             setComments((prevComments) => ({
//                 ...prevComments,
//                 [decisionId]: [],
//             }));
//         }
//     };

//     useEffect(() => {
//         sharedDecisionCircles.forEach((item) => {
//             fetchComments(item.id, item.decision_id);
//         });
//     }, [sharedDecisionCircles]);

//     return (
//         <div>
//             <div className='ml-5'>
//                 <Link to='/sharedDecisions'>
//                     <button>Go Back</button>
//                 </Link>
//             </div>
//             <Box p={3}>
//                 <h2>Decision Circle Decisions:</h2>
//                 {isLoading ? (
//                     <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
//                         <CircularProgress />
//                     </Box>
//                 ) : (
//                     <>
//                         {sharedDecisionCircles.length === 0 ? (
//                             <Typography variant="h5" align="center" mt={2} mb={2}>
//                                 No shared decisions
//                             </Typography>
//                         ) : (
//                             <>
//                                 <ButtonGroup
//                                     sx={{
//                                         marginBottom: "1rem",
//                                         display: "flex",
//                                         justifyContent: "flex-end",
//                                         gap: "0.5rem",
//                                         margin: "1rem",
//                                         flexDirection: { xs: 'column', sm: 'row' }
//                                     }}
//                                 >
//                                     <ToggleButton
//                                         value={true}
//                                         selected={showPending}
//                                         onClick={() => setShowPending(true)}
//                                         sx={{
//                                             color: showPending ? '#fff' : '#000',
//                                             border: showPending ? "0.12rem solid #3F5362" : "0.1rem solid #3F5362",
//                                             backgroundColor: showPending ? '#3F5362' : 'default',
//                                             height: "3rem",
//                                             '&:hover': {
//                                                 color: showPending ? '#fff' : '#000',
//                                                 backgroundColor: showPending ? '#465e70' : 'default'
//                                             },
//                                         }}
//                                     >
//                                         Show Pending Decisions
//                                     </ToggleButton>
//                                     <ToggleButton
//                                         value={false}
//                                         selected={!showPending}
//                                         onClick={() => setShowPending(false)}
//                                         sx={{
//                                             color: !showPending ? '#fff' : '#000',
//                                             border: !showPending ? "0.12rem solid #3F5362" : "0.1rem solid #3F5362",
//                                             backgroundColor: !showPending ? '#3F5362' : 'default',
//                                             height: "3rem",
//                                             '&:hover': {
//                                                 color: !showPending ? '#fff' : '#000',
//                                                 backgroundColor: !showPending ? '#465e70' : 'default'
//                                             },
//                                         }}
//                                     >
//                                         Show All Decisions
//                                     </ToggleButton>
//                                 </ButtonGroup>
//                                 {filteredDecisions.length === 0 ? (
//                                     <Typography variant="h5" align="center" mt={2} mb={2}>
//                                         {showPending ? 'No pending decisions' : 'No decisions found'}
//                                     </Typography>
//                                 ) : (
//                                     filteredDecisions.map((item, index) => (
//                                         <Card key={index} variant="outlined" style={{ margin: "1rem" }}>
//                                             <CardContent>
//                                                 <Grid container spacing={2} alignItems="center">
//                                                     <Grid item>
//                                                         <Avatar sx={{ bgcolor: "#526D82", color: "white" }}>
//                                                             {item.shared_by[0]}
//                                                         </Avatar>
//                                                     </Grid>
//                                                     <Grid item xs>
//                                                         <Typography variant="h6">
//                                                             Decision: {item.decision_name}
//                                                         </Typography>
//                                                         <Typography variant="body2">
//                                                             Group Name : {item.group_name}
//                                                         </Typography>
//                                                         <Typography variant="body2">
//                                                             Shared By: {item.shared_by} | {item.shared_by_email}
//                                                         </Typography>
//                                                     </Grid>
//                                                 </Grid>
//                                                 <Typography variant="body1" mt={2}>
//                                                     Reasons:
//                                                 </Typography>
//                                                 {item.reasons && item.reasons.length > 0 ? (
//                                                     item.reasons.map((reason, reasonIndex) => (
//                                                         <Typography key={reasonIndex} variant="body1" style={{ marginLeft: '16px' }}>
//                                                             - {reason}
//                                                         </Typography>
//                                                     ))
//                                                 ) : (
//                                                     <Typography variant="body1" style={{ marginLeft: '16px' }}>
//                                                         No reasons provided
//                                                     </Typography>
//                                                 )}
//                                                 <Typography variant="body1">
//                                                     Due Date: {item.decision_due_date ? new Date(item.decision_due_date).toLocaleDateString() : 'N/A'}
//                                                 </Typography>
//                                                 {item.decision_taken_date && (
//                                                     <Typography variant="body1">
//                                                         Taken Date: {new Date(item.decision_taken_date).toLocaleDateString()}
//                                                     </Typography>
//                                                 )}
//                                                 <Typography variant="body1" color="textSecondary">
//                                                     User Statement: {item.user_statement}
//                                                 </Typography>
//                                             </CardContent>
//                                             <CardContent>
//                                                 <List>
//                                                     {Array.isArray(comments[item.decision_id]) &&
//                                                         comments[item.decision_id].map((comment) => (
//                                                             <ListItem key={comment.commentId}>
//                                                                 <ListItemText
//                                                                     primary={comment.comment}
//                                                                     secondary={
//                                                                         <Box
//                                                                             className="comment-content"
//                                                                             style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}
//                                                                         >
//                                                                             <Avatar
//                                                                                 sx={{ textAlign: 'end', bgcolor: "#526D82", color: "white", marginRight: 2 }}
//                                                                             >
//                                                                                 {comment.displayname ? comment.displayname[0] : "?"}
//                                                                             </Avatar>
//                                                                             <div style={{ flex: 1 }}>
//                                                                                 <Typography variant="caption">
//                                                                                     {comment.displayname || "Unknown User"} | {comment.email || "No Email"} |{" "}
//                                                                                     {comment.created_at === comment.updated_at ? (
//                                                                                         <span>
//                                                                                             {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}
//                                                                                         </span>
//                                                                                     ) : (
//                                                                                         <span>
//                                                                                             Edited {formatDistanceToNow(parseISO(comment.updated_at), { addSuffix: true })}
//                                                                                         </span>
//                                                                                     )}
//                                                                                 </Typography>
//                                                                             </div>
//                                                                         </Box>
//                                                                     }
//                                                                 />
//                                                             </ListItem>
//                                                         ))}
//                                                 </List>
//                                                 <Box mt={2}>
//                                                     <input
//                                                         label="Add Comment"
//                                                         variant="outlined"
//                                                         fullwidth={true}
//                                                         placeholder="Add a comment..."
//                                                         style={{
//                                                             height: "3rem", padding: "1rem", width: "100%", maxWidth: "100%", marginRight: "0.5rem",
//                                                         }}
//                                                         value={newComment[item.decision_id] || ''}
//                                                         onChange={(e) => handleCommentChange(item.decision_id, e.target.value)}
//                                                     />
//                                                     <Grid container spacing={2} justifyContent="flex-end">
//                                                         <Grid item>
//                                                             <Button
//                                                                 variant="contained"
//                                                                 color="primary"
//                                                                 style={{ marginTop: "1rem" }}
//                                                                 onClick={() => handlePostComment(item.decision_id, item.id)}
//                                                                 disabled={
//                                                                     !comments[item.decision_id] ||
//                                                                     buttonLoading[item.decision_id]
//                                                                 }
//                                                             >
//                                                                 {buttonLoading[item.decision_id] ? (
//                                                                     <CircularProgress size={24} />
//                                                                 ) : (
//                                                                     "Save"
//                                                                 )}
//                                                             </Button>
//                                                         </Grid>
//                                                     </Grid>
//                                                 </Box>
//                                             </CardContent>

//                                         </Card>
//                                     ))
//                                 )}
//                             </>
//                         )}
//                     </>
//                 )}
//                 <Popover
//                     open={isPopoverOpen}
//                     anchorEl={anchorEl}
//                     onClose={handlePopoverClose}
//                     anchorOrigin={{
//                         vertical: 'top', horizontal: 'center',
//                     }}
//                     transformOrigin={{
//                         vertical: 'top', horizontal: 'center',
//                     }}
//                 />
//                 <ToastContainer />
//             </Box>
//         </div>
//     );
// };

// export default withAuth(SharedDecisionCircle);



// import React, { useEffect, useState } from 'react';
// import {
//     Box,
//     Card,
//     CardContent,
//     Typography,
//     Button,
//     List,
//     ListItem,
//     ListItemText,
//     CircularProgress,
//     TextField,
// } from '@mui/material';
// import { ToastContainer, toast } from 'react-toastify';
// import { Link } from 'react-router-dom';
// import withAuth from '../withAuth';
// import axios from 'axios';
// import {getdecisionSharedDecisionCirclebyuser} from '../Decision_Circle/Networkk_Call'


// const SharedDecisionCircle = () => {
//     const [sharedDecisionCircles, setSharedDecisionCircles] = useState([]);
//     const [comments, setComments] = useState({});
//     const [newComment, setNewComment] = useState({});
//     const [isLoading, setIsLoading] = useState(true);

//     const fetchSharedDecisionCircles = async () => {
//         try {
//             setIsLoading(true);
//             const response = await getdecisionSharedDecisionCirclebyuser();
//             setSharedDecisionCircles(response || []);
//         } catch (error) {
//             console.error('Error fetching shared decisions:', error);
//             toast.error('Error fetching shared decisions');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const fetchComments = async (groupId, decisionId) => {
//         try {
//             const response = await axios.get(
//                 `${process.env.REACT_APP_API_URL}/group/comment?groupId=${groupId}&decisionId=${decisionId}`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem('token')}`,
//                     },
//                 }
//             );
//             setComments((prevComments) => ({
//                 ...prevComments,
//                 [decisionId]: response.data.comments || [],
//             }));
//         } catch (error) {
//             console.error('Error fetching comments:', error);
//         }
//     };

//     const handleInputChange = (decisionId, value) => {
//         setNewComment((prevNewComment) => ({
//             ...prevNewComment,
//             [decisionId]: value,
//         }));
//     };

//     const handlePostComment = async (decisionId, groupId) => {
//         const commentText = newComment[decisionId];
//         if (!commentText) {
//             toast.error('Comment cannot be empty');
//             return;
//         }

//         try {
//             await axios.post(
//                 `${process.env.REACT_APP_API_URL}/group/comment`,
//                 { groupId, decisionId, comment: commentText },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem('token')}`,
//                     },
//                 }
//             );
//             toast.success('Comment posted successfully');
//             fetchComments(groupId, decisionId); // Refresh comments
//             setNewComment((prevNewComment) => ({
//                 ...prevNewComment,
//                 [decisionId]: '',
//             })); // Clear input
//         } catch (error) {
//             console.error('Error posting comment:', error);
//             toast.error('Error posting comment');
//         }
//     };

//     useEffect(() => {
//         fetchSharedDecisionCircles();
//     }, []);

//     useEffect(() => {
//         sharedDecisionCircles.forEach((item) => {
//             fetchComments(item.id, item.decision_id);
//         });
//     }, [sharedDecisionCircles]);

//     return (
//         <div>
//             <Box p={3}>
//                 <Typography variant="h4" gutterBottom>
//                     Shared Decision Circles
//                 </Typography>
//                 <Link to="/sharedDecisions">
//                     <Button variant="contained">Go Back</Button>
//                 </Link>
//                 <ToastContainer />
//                 {isLoading ? (
//                     <CircularProgress />
//                 ) : (
//                     sharedDecisionCircles.map((decision) => (
//                         <Card key={decision.decision_id} sx={{ mb: 3 }}>
//                             <CardContent>
//                                 <Typography variant="h6">
//                                     {decision.decision_name}
//                                 </Typography>
//                                 <Typography color="text.secondary">
//                                     {decision.user_statement}
//                                 </Typography>
//                                 <Typography variant="body2">
//                                     Group: {decision.group_name}
//                                 </Typography>
//                                 <Typography variant="body2">
//                                     Shared By: {decision.shared_by_email}
//                                 </Typography>
//                                 <Typography variant="body2">
//                                     Due Date:{' '}
//                                     {new Date(decision.decision_due_date).toLocaleDateString()}
//                                 </Typography>
//                                 <Typography variant="subtitle1" sx={{ mt: 2 }}>
//                                     Comments:
//                                 </Typography>
//                                 <List>
//                                     {(comments[decision.decision_id] || []).map((comment) => (
//                                         <ListItem key={comment.commentId}>
//                                             <ListItemText
//                                                 primary={comment.comment}
//                                                 secondary={`By Member ID: ${comment.member_id} | Created At: ${new Date(comment.created_at).toLocaleString()}`}
//                                             />
//                                         </ListItem>
//                                     ))}
//                                 </List>
//                                 <TextField
//                                     label="Add a Comment"
//                                     variant="outlined"
//                                     size="small"
//                                     fullWidth
//                                     sx={{ mt: 2 }}
//                                     value={newComment[decision.decision_id] || ''}
//                                     onChange={(e) =>
//                                         handleInputChange(decision.decision_id, e.target.value)
//                                     }
//                                 />
//                                 <Button
//                                     variant="contained"
//                                     sx={{ mt: 1 }}
//                                     onClick={() =>
//                                         handlePostComment(decision.decision_id, decision.id)
//                                     }
//                                 >
//                                     Post Comment
//                                 </Button>
//                             </CardContent>
//                         </Card>
//                     ))
//                 )}
//             </Box>
//         </div>
//     );
// };

// export default withAuth(SharedDecisionCircle);
