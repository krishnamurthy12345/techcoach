// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './GetGroup.css';
// import { removeUsersFromGroup, getdecisionSharedDecisionCircle,getComments } from './Networkk_Call';
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import { IoPersonAdd } from "react-icons/io5";
// import { IoMdRemoveCircle } from "react-icons/io";
// import { Card, CardContent, Typography, Grid,Avatar } from '@mui/material';



// const ShowUsers = () => {
//     const [groups, setGroups] = useState(null);
//     const [decisions, setDecisions] = useState([]);
//     const [members, setMembers] = useState([]);
//     const { groupId } = useParams();
//     const location = useLocation();
//     const [comments, setComments] = useState({});


//     const params = new URLSearchParams(location.search);
//     const groupName = params.get('group_name');

//     const navigate = useNavigate();

//     useEffect(() => {
//         if (groupId) {
//             fetchGroupDetails();
//             fetchDecisions();
//         }
//     }, [groupId]);

//     const fetchGroupDetails = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getUsersForGroup/${groupId}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             console.log('Response data:', response.data);
//             if (response.data.error) {
//                 toast.error(response.data.error);
//             } else {
//                 setGroups(response.data.group);
//                 setMembers(response.data.members || []);
//             }
//         } catch (err) {
//             toast.error('An error occurred while fetching the details');
//             console.error(err);
//             fetchGroupDetails();
//         }
//     };

//     const handleRemoveUser = async (userId, e) => {
//         e?.preventDefault();
//         try {
//             setMembers((prevMembers) => prevMembers.filter(member => member.user_id !== userId));
//             const response = await removeUsersFromGroup(groupId, userId);
//             setGroups(response.group);
//             setMembers(response.members);
//             fetchGroupDetails();
//             toast.success('User removed successfully');
//         } catch (error) {
//             toast.error('Error removing user from group');
//             console.log('Fetching error:', error);
//             fetchGroupDetails();
//         }
//     }

//     const handleAddPersonClick = () => {
//         console.log('Group data:', groups);

//         if (groups.length > 0 && groups[0].group_name && groups[0].id) {
//             navigate(`/decisiongroup/${groups[0].group_name}?id=${groups[0].id}`);
//         } else {
//             toast.error('Group details are not available.');
//         }
//     };

//     const fetchDecisions = async () => {
//         try {
//             const data = await getdecisionSharedDecisionCircle(groupId);
//             setDecisions(data);
//             data.forEach((decision) => fetchComments(groupId, decision.decision_id));
//             console.log('Fetched decisions:', data);
//         } catch (error) {
//             toast.error('Failed to fetch decisions');
//         }
//     };

//     const fetchComments = async (groupId, decisionId) => {
//         try {
//             const response = await getComments(groupId, decisionId);
//             setComments(prevComments => ({
//                 ...prevComments,
//                 [decisionId]: response || [],
//             }));
//         } catch (error) {
//             console.error('Error fetching comments:', error);
//         }
//     };


//     return (
//         <div className="getGroupp">
//             {groups && (
//                 <div className="group-details">
//                     <h4>{groupName || groups.group_name}</h4>
//                     <IoPersonAdd className='icon' onClick={handleAddPersonClick} />
//                     {members.length > 0 ? (
//                         <ul className="group-members">
//                             {members.map(member => (
//                                 <li key={member.user_id}>
//                                     {member.displayname} ({member.email})
//                                     <IoMdRemoveCircle onClick={() => handleRemoveUser(member.user_id)} />
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p>No members found in this group.</p>
//                     )}
//                 </div>
//             )}

//             <div>
//                 <h4>Shared Decisions</h4>
//                 <Grid container spacing={3}>
//                     {Array.isArray(decisions) && decisions.length > 0 ? (
//                         decisions.map(decision => (
//                             <Grid item xs={12} sm={6} md={6} key={decision.decision_id}>
//                                 <Card>
//                                     <CardContent>
//                                         <Typography variant="h6" component="div">
//                                             {decision.decision_name}
//                                         </Typography>
//                                         <Typography variant="body2" color="">
//                                             <b>Decision Details:</b> {decision.user_statement}
//                                         </Typography>
//                                         <Typography variant="body2" color="">
//                                             <b>Due Date:</b> {decision.decision_due_date ? new Date(decision.decision_due_date).toISOString().split('T')[0] : ''}
//                                         </Typography>
//                                         <Typography variant="body2" color="">
//                                             <b>Taken Date:</b> {decision.decision_taken_date ? new Date(decision.decision_due_date).toISOString().split('T')[0] : ''}
//                                         </Typography>
//                                         <Typography variant="body2" color="">
//                                             <b>Decision Reasons:</b> {decision.decision_reason.join(',')}
//                                         </Typography>
//                                         <Typography variant="body2">
//                                             <b>Selected Tags:</b> {decision.tags && decision.tags.map(tag => tag.tag_name).join(', ')}
//                                         </Typography>
//                                         <div className='comments-section'>
//                                             <h6>Comments:</h6>
//                                             {comments[decision.decision_id]?.length > 0 ? (
//                                                 comments[decision.decision_id].map((comment) => {
//                                                     <div key={comment.id} className="comment-text" style={{ fontWeight: 'bold', flex: 1 }}>
//                                                         <div>
//                                                             <Typography>{comment.comment}</Typography>
//                                                         </div>
//                                                         <div className="comment-content" style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
//                                                         <Avatar sx={{ bgcolor: "#526D82", color: "white", marginRight: 2 }}>
//                                                             {comment.displayname[0]}
//                                                         </Avatar>
//                                                         <div style={{ flex: 1 }}>
//                                                             <Typography variant="body2" className="comment-username" style={{ fontWeight: '500' }}>
//                                                                 {comment.displayname} ({comment.email})
//                                                             </Typography>
//                                                             <Typography variant="caption" className="comment-timestamp" style={{ color: 'gray' }}>
//                                                                 {new Date(comment.created_at).toLocaleTimeString()} 
//                                                             </Typography>
//                                                         </div>
//                                                     </div>
//                                                     </div>
//                                                 })
//                                             ) : (
//                                                 <Typography>No comments</Typography>
//                                             )}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </Grid>
//                         ))
//                     ) : (
//                         <Typography sx={{ mt: 2, ml: 3 }} variant="body2" color="text.secondary" >
//                             No decisions available.
//                         </Typography>
//                     )}
//                 </Grid>
//             </div>
//             <ToastContainer />
//         </div>
//     );
// };

// export default ShowUsers;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GetGroup.css';
import { removeUsersFromGroup, getdecisionSharedDecisionCircle, getComments, replyToComment } from './Networkk_Call';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { IoPersonAdd } from "react-icons/io5";
import { IoMdRemoveCircle } from "react-icons/io";
import { Card, CardContent, Typography, Grid, Avatar } from '@mui/material';
import { formatDistanceToNow, parseISO } from 'date-fns';

const ShowUsers = () => {
    const [groups, setGroups] = useState(null);
    const [decisions, setDecisions] = useState([]);
    const [members, setMembers] = useState([]);
    const { groupId } = useParams();
    const location = useLocation();
    const [comments, setComments] = useState({});
    const [replyComment, setReplyComment] = useState('');

    const params = new URLSearchParams(location.search);
    const groupName = params.get('group_name');

    const navigate = useNavigate();

    useEffect(() => {
        if (groupId) {
            fetchGroupDetails();
            fetchDecisions();
        }
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getUsersForGroup/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.error) {
                toast.error(response.data.error);
            } else {
                setGroups(response.data.group);
                setMembers(response.data.members || []);
            }
        } catch (err) {
            toast.error('An error occurred while fetching the details');
            console.error(err);
        }
    };

    const handleRemoveUser = async (userId, e) => {
        e?.preventDefault();
        try {
            setMembers((prevMembers) => prevMembers.filter(member => member.user_id !== userId));
            await removeUsersFromGroup(groupId, userId);
            fetchGroupDetails();
            toast.success('User removed successfully');
        } catch (error) {
            toast.error('Error removing user from group');
            console.log('Error:', error);
        }
    };

    const handleAddPersonClick = () => {
        if (groups.length > 0 && groups[0].group_name && groups[0].id) {
            navigate(`/decisiongroup/${groups[0].group_name}?id=${groups[0].id}`);
        } else {
            toast.error('Group details are not available.');
        }
    };

    const fetchDecisions = async () => {
        try {
            const data = await getdecisionSharedDecisionCircle(groupId);
            setDecisions(data);
            data.forEach((decision) => fetchComments(groupId, decision.decision_id));
        } catch (error) {
            // toast.error('Failed to fetch decisions');
            console.log('Failed to fetch decisions');
        }
    };

    const handleReplyComment = async (decisionId, memberId, parentCommentId) => {
        try {
            if (!replyComment.trim()) {
                return toast.error('Comment cannot be empty');
            }
            const memberExists = members.some(member => member.user_id === memberId);
            if (!memberExists) {
                return toast.error('Invalid member Id');
            }
            const data = {
                group_id: groupId,
                member_id: memberId,
                comment: replyComment,
                decision_id: decisionId,
                parentCommentId: parentCommentId
            }
            await replyToComment(data);
            setReplyComment('');
            toast.success('Reply comment Successfully');
            fetchComments(groupId, decisionId);
        } catch (error) {
            toast.error('Error reply comment');
            console.error('Error Posting Comment:', error)
        }
    }

    const fetchComments = async (groupId, decisionId) => {
        try {
            const response = await getComments(groupId, decisionId);
            setComments(prevComments => ({
                ...prevComments,
                [decisionId]: response || [],
            }));
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    return (
        <div className="getGroupp">
            {groups && (
                <div className="group-details">
                    <h4>{groupName || groups.group_name}</h4>
                    <IoPersonAdd className='icon' onClick={handleAddPersonClick} />
                    {members.length > 0 ? (
                        <ul className="group-members">
                            {members.map(member => (
                                <li key={member.user_id}>
                                    {member.displayname} ({member.email})
                                    <IoMdRemoveCircle onClick={() => handleRemoveUser(member.user_id)} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No members found in this group.</p>
                    )}
                </div>
            )}

            <div>
                <h4>Shared by Decisions</h4>
                <Grid container spacing={3}>
                    {Array.isArray(decisions) && decisions.length > 0 ? (
                        decisions.map(decision => (
                            <Grid item xs={12} sm={6} md={12} key={decision.decision_id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            {decision.decision_name}
                                        </Typography>
                                        <Typography variant="body2" color="">
                                            <b>Decision Details:</b> {decision.user_statement}
                                        </Typography>
                                        <Typography variant="body2" color="">
                                            <b>Due Date:</b> {decision.decision_due_date ? new Date(decision.decision_due_date).toISOString().split('T')[0] : ''}
                                        </Typography>
                                        <Typography variant="body2" color="">
                                            <b>Taken Date:</b> {decision.decision_taken_date ? new Date(decision.decision_due_date).toISOString().split('T')[0] : ''}
                                        </Typography>
                                        <Typography variant="body2" color="">
                                            <b>Decision Reasons:</b> {decision.decision_reason.join(',')}
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>Selected Tags:</b> {decision.tags && decision.tags.map(tag => tag.tag_name).join(', ')}
                                        </Typography>
                                        <Typography variant='h6'>shared by :{decision.shared_by}</Typography>

                                        <h6 className='mt-3'>Comments:</h6>
                                        <div className='comments-section'>
                                            {comments[decision.decision_id]?.length > 0 ? (
                                                comments[decision.decision_id].map((comment) => (
                                                    <div key={comment.id} style={{ fontWeight: 'bold', flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-start', width: '60%', marginBottom: '16px', backgroundColor: '#fff' }}>
                                                            <div style={{ flex: 1 }}>
                                                                <Typography>{comment.comment}</Typography>
                                                                <div className="comment-content" style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                                                    <Avatar sx={{ bgcolor: "#526D82", color: "white", marginRight: 2 }}>
                                                                        {comment.displayname[0]}
                                                                    </Avatar>
                                                                    <div style={{ flex: 1 }}>
                                                                        <Typography variant='caption' color=''>
                                                                            {comment.displayname} | {comment.email} |
                                                                            {comment.created_at === comment.updated_at
                                                                                ? <span> {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}</span>
                                                                                : <span>Edited {formatDistanceToNow(parseISO(comment.updated_at), { addSuffix: true })}</span>}
                                                                        </Typography>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', justifyContent: 'end', marginBottom: '16px' }}>
                                                            <div style={{ backgroundColor: '#edf6fc', padding: '3px', borderRadius: '8px', width: '60%' }}>
                                                                <input
                                                                    type='text'
                                                                    className='comment-input'
                                                                    placeholder='Write a reply comment'
                                                                    value={replyComment}
                                                                    onChange={(e) => setReplyComment(e.target.value)}
                                                                    style={{ width: '40%', marginLeft: '80px', fontSize: '12px' }}
                                                                />
                                                                <button style={{ width: '50px', fontSize: '14px', marginLeft: '100px', borderRadius: '4px', backgroundColor: '#007BFF', color: 'White', border: 'none' }}
                                                                    onClick={() => handleReplyComment(decision.decision_id, members[0]?.user_id, comment.id)}>
                                                                    Reply
                                                                </button>
                                                            </div>
                                                            {comment.replies?.length > 0 && (
                                                                <div style={{ display: 'flex', alignItems: 'right', flexDirection: 'column', marginTop: '8px' }}>
                                                                    {comment.replies.map((reply) => (
                                                                        <div key={reply.id} className="reply-comment" style={{ backgroundColor: '#edf6fc', padding: '8px', borderRadius: '8px', marginRight: 'auto', width: '30%', marginTop: '3px' }}>
                                                                            <Typography variant='caption' color=''>
                                                                                {comment.displayname} | {comment.email} |
                                                                                {comment.created_at === comment.updated_at
                                                                                    ? <span> {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}</span>
                                                                                    : <span>Edited {formatDistanceToNow(parseISO(comment.updated_at), { addSuffix: true })}</span>}
                                                                            </Typography>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <Typography>No comments available.</Typography>
                                            )}
                                        </div>   
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography sx={{ mt: 2, ml: 3 }} variant="body2" color="text.secondary">
                            No decisions available.
                        </Typography>
                    )}
                </Grid>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ShowUsers;
