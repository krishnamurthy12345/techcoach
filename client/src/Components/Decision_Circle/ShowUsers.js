// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './GetGroup.css';
// import './CommentStyle.css';
// import { removeUsersFromGroup, getdecisionSharedDecisionCircle, getComments, replyToComment } from './Networkk_Call';
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import { IoPersonAdd } from "react-icons/io5";
// import { IoMdRemoveCircle } from "react-icons/io";
// import { Card, CardContent, Typography, Grid, Avatar } from '@mui/material';
// import { formatDistanceToNow, parseISO } from 'date-fns';

// const ShowUsers = () => {
//     const [groups, setGroups] = useState(null);
//     const [decisions, setDecisions] = useState([]);
//     const [members, setMembers] = useState([]);
//     const [comments, setComments] = useState({});
//     const [replyComment, setReplyComment] = useState('');
//     const { groupId } = useParams();
//     const location = useLocation();
//     const navigate = useNavigate();

//     const params = new URLSearchParams(location.search);
//     const groupName = params.get('group_name');

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
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             if (response.data.error) {
//                 toast.error(response.data.error);
//             } else {
//                 setGroups(response.data.group);
//                 setMembers(response.data.members || []);
//             }
//         } catch (err) {
//             toast.error('An error occurred while fetching the details');
//             console.error(err);
//         }
//     };

//     const handleRemoveUser = async (userId, e) => {
//         e.preventDefault();
//         try {
//             setMembers((prevMembers) => prevMembers.filter(member => member.user_id !== userId));
//             await removeUsersFromGroup(groupId, userId);
//             fetchGroupDetails();
//             toast.success('User removed successfully');
//         } catch (error) {
//             toast.error('Error removing user from group');
//             console.log('Error:', error);
//         }
//     };

//     const handleAddPersonClick = () => {
//         if (groups && groups.length > 0 && groups[0].group_name && groups[0].id) {
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
//         } catch (error) {
//             console.log('Failed to fetch decisions');
//         }
//     };

//     const handleReplyComment = async (decisionId, memberId, parentCommentId) => {
//         try {
//             if (!replyComment.trim()) {
//                 return toast.error('Comment cannot be empty');
//             }
//             const memberExists = members.some(member => member.user_id === memberId);
//             if (!memberExists) {
//                 return toast.error('Invalid member Id');
//             }
//             const data = {
//                 groupId,                    
//                 groupMemberId: memberId,    
//                 commentText: replyComment,  
//                 decisionId,                 
//                 parentCommentId             
//             };
//             await replyToComment(data);
//             setReplyComment('');
//             toast.success('Reply comment successfully posted');
//             fetchComments(groupId, decisionId); 
//         } catch (error) {
//             toast.error('Error posting reply comment');
//             console.error('Error posting comment:', error);
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
//                                     <IoMdRemoveCircle onClick={(e) => handleRemoveUser(member.user_id, e)} />
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p>No members found in this group.</p>
//                     )}
//                 </div>
//             )}

//             <div>
//                 <h4>Shared by Decisions</h4>
//                 <Grid container spacing={3}>
//                     {Array.isArray(decisions) && decisions.length > 0 ? (
//                         decisions.map(decision => (
//                             <Grid item xs={12} sm={6} md={12} key={decision.decision_id}>
//                                 <Card>
//                                     <CardContent>
//                                         <Typography variant="h6">{decision.decision_name}</Typography>
//                                         <Typography variant="body2">
//                                             <b>Decision Details:</b> {decision.user_statement}
//                                         </Typography>
//                                         <Typography variant="body2">
//                                             <b>Due Date:</b> {decision.decision_due_date ? new Date(decision.decision_due_date).toISOString().split('T')[0] : ''}
//                                         </Typography>
//                                         <Typography variant="body2">
//                                             <b>Taken Date:</b> {decision.decision_taken_date ? new Date(decision.decision_taken_date).toISOString().split('T')[0] : ''}
//                                         </Typography>
//                                         <Typography variant="body2">
//                                             <b>Decision Reasons:</b> {decision.decision_reason.join(', ')}
//                                         </Typography>
//                                         <Typography variant="body2">
//                                             <b>Selected Tags:</b> {decision.tags && decision.tags.map(tag => tag.tag_name).join(', ')}
//                                         </Typography>
//                                         <Typography variant='h6'>Shared by: {decision.shared_by}</Typography>

//                                         <h6 className='mt-3'>Comments:</h6>
//                                         <div className='comments-section'>
//                                             {comments[decision.decision_id] && comments[decision.decision_id].length > 0 ? (
//                                                 comments[decision.decision_id].map(comment => (
//                                                     <div key={comment.id} style={{ marginBottom: '16px', backgroundColor: '#fff' }}>
//                                                         <Typography>{comment.comment}</Typography>
//                                                         <div className="comment-content" style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
//                                                             <Avatar sx={{ bgcolor: "#526D82", color: "white", marginRight: 2 }}>
//                                                                 {comment.displayname[0]}
//                                                             </Avatar>
//                                                             <div>
//                                                                 <Typography variant='caption'>
//                                                                     {comment.displayname} | {comment.email} |
//                                                                     {comment.created_at === comment.updated_at
//                                                                         ? <span> {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}</span>
//                                                                         : <span>Edited {formatDistanceToNow(parseISO(comment.updated_at), { addSuffix: true })}</span>}
//                                                                 </Typography>
//                                                             </div>
//                                                         </div>
//                                                         <div style={{ display: 'flex', justifyContent: 'end', marginTop: '8px' }}>
//                                                             <input
//                                                                 type='text'
//                                                                 className='comment-input'
//                                                                 placeholder='Write a reply comment'
//                                                                 value={replyComment}
//                                                                 onChange={(e) => setReplyComment(e.target.value)}
//                                                                 style={{ width: '60%', fontSize: '12px', marginRight: '8px' }}
//                                                             />
//                                                             <button style={{ fontSize: '14px', borderRadius: '4px', backgroundColor: '#007BFF', color: 'white', border: 'none', padding: '5px 10px' }}
//                                                                 onClick={() => handleReplyComment(decision.decision_id, members[0]?.user_id, comment.id)}>
//                                                                 Reply
//                                                             </button>
//                                                             <button style={{ fontSize: '14px', borderRadius: '4px', backgroundColor: '#007BFF', color: 'white', border: 'none', padding: '5px 10px' }}
//                                                                 onClick={() => handleReplyComment(decision.decision_id, members[0]?.user_id, comment.id)}>
//                                                                 Save and Email
//                                                             </button>
//                                                         </div>
//                                                     </div>
//                                                 ))
//                                             ) : (
//                                                 <Typography>No comments available.</Typography>
//                                             )}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </Grid>
//                         ))
//                     ) : (
//                         <Typography sx={{ mt: 2, ml: 3 }} variant="body2" color="text.secondary">
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
import './CommentStyle.css';
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
    const [comments, setComments] = useState({});
    const [replyComment, setReplyComment] = useState('');
    const { groupId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const groupName = params.get('group_name');

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
                headers: { Authorization: `Bearer ${token}` },
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
        e.preventDefault();
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
        if (groups && groups.length > 0 && groups[0].group_name && groups[0].id) {
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
            console.log('Failed to fetch decisions');
        }
    };

    const handleReplyComment = async (decisionId, memberId, parentCommentId, notify = false) => {
        try {
            if (!replyComment.trim()) {
                return toast.error('Comment cannot be empty');
            }
            const memberExists = members.some(member => member.user_id === memberId);
            if (!memberExists) {
                return toast.error('Invalid member Id');
            }
            const data = {
                groupId,
                groupMemberId: memberId,
                commentText: replyComment,
                decisionId,
                parentCommentId
            };
            await replyToComment(data, notify);
            setReplyComment('');
            toast.success('Reply comment successfully posted');
            fetchComments(groupId, decisionId);
        } catch (error) {
            toast.error('Error posting reply comment');
            console.error('Error posting comment:', error);
        }
    };

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
                                    <IoMdRemoveCircle onClick={(e) => handleRemoveUser(member.user_id, e)} />
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
                                        <Typography variant="h6">{decision.decision_name}</Typography>
                                        <Typography variant="body2">
                                            <b>Decision Details:</b> {decision.user_statement}
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>Due Date:</b> {decision.decision_due_date ? new Date(decision.decision_due_date).toISOString().split('T')[0] : ''}
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>Taken Date:</b> {decision.decision_taken_date ? new Date(decision.decision_taken_date).toISOString().split('T')[0] : ''}
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>Decision Reasons:</b> {decision.decision_reason.join(', ')}
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>Selected Tags:</b> {decision.tags && decision.tags.map(tag => tag.tag_name).join(', ')}
                                        </Typography>
                                        <Typography variant='h6'>Shared by: {decision.shared_by}</Typography>

                                        <h6 className='mt-3'>Comments:</h6>
                                        <div className='comments-section'>
                                            {comments[decision.decision_id] && comments[decision.decision_id].length > 0 ? (
                                                comments[decision.decision_id].map(comment => (
                                                    <div
                                                        key={comment.id}
                                                        className={`comment-box ${comment.type_of_member === 'author' ? 'author-comment' : 'member-comment'}`}
                                                        style={{
                                                            backgroundColor: comment.type_of_member === 'author' ? '#d1ecf1' : '#fff',
                                                            textAlign: comment.type_of_member === 'author' ? 'right' : 'left',
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            marginBottom: '16px',
                                                            position:'relative',
                                                        }}
                                                    >
                                                        <Typography>{comment.comment}</Typography>
                                                        <div className="comment-content" style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                                            <Avatar sx={{ bgcolor: "#526D82", color: "white", marginRight: 2 }}>
                                                                {comment.displayname[0]}
                                                            </Avatar>
                                                            <div>
                                                                <Typography variant='caption'>
                                                                    {comment.displayname} | {comment.email} |
                                                                    {comment.created_at === comment.updated_at
                                                                        ? <span> {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}</span>
                                                                        : <span>Edited {formatDistanceToNow(parseISO(comment.updated_at), { addSuffix: true })}</span>}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'end', marginTop: '8px', gap: '10px', backgroundColor: '#b7f2fe', borderRadius: '8px' }}>
                                                            <input
                                                                type='text'
                                                                className='comment-input'
                                                                placeholder='Write a reply comment'
                                                                value={replyComment}
                                                                onChange={(e) => setReplyComment(e.target.value)}
                                                                style={{ width: '60%', fontSize: '12px', marginRight: '8px' }}
                                                            />
                                                            <button
                                                                style={{ fontSize: '14px', borderRadius: '4px', backgroundColor: '#007BFF', color: 'white', border: 'none', padding: '5px 10px' }}
                                                                onClick={() => handleReplyComment(decision.decision_id, members[0]?.user_id, comment.id, false)}>
                                                                Reply
                                                            </button>
                                                            <button
                                                                style={{ fontSize: '14px', borderRadius: '4px', backgroundColor: '#007BFF', color: 'white', border: 'none', padding: '5px 10px' }}
                                                                onClick={() => handleReplyComment(decision.decision_id, members[0]?.user_id, comment.id, true)}>
                                                                Reply & Email
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No comments yet</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="body2">No decisions available.</Typography>
                    )}
                </Grid>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ShowUsers;
