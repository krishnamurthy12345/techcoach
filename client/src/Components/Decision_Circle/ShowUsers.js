import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ShowUsers.css';
import { removeUsersFromGroup, getdecisionSharedDecisionCircle, getComments, replyToComment, mailToDecisionCircleReplyComment } from './Networkk_Call';
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
    const [replyComment, setReplyComment] = useState({});
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
            // console.log('members',response);
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
            console.log('qwww', data);
            data.forEach((decision) => fetchComments(groupId, decision.decision_id));
        } catch (error) {
            console.log('Failed to fetch decisions');
        }
    };

    const handleReplyComment = async (decisionId,parentCommentId) => {
        try {
            const commentText = replyComment[decisionId]?.[parentCommentId]?.trim();
            if (!commentText) {
                return toast.error('Comment cannot be empty');
            }
        
            const data = {
                groupId,
                commentText,
                decisionId,
                parentCommentId
            };
            await replyToComment(data);
            setReplyComment(prev => ({ ...prev, [decisionId]: {...prev[decisionId],[parentCommentId]:''}}));
            toast.success('Reply comment successfully posted');
            fetchComments(groupId, decisionId);
        } catch (error) {
            toast.error('Error posting reply comment');
            console.error('Error posting comment:', error);
        }
    };

    const handleMailToReplyComment = async (decisionId,parentCommentId,reply) => {
        console.log('Decision ID:', decisionId);
        console.log("Parent Comment ID:", parentCommentId);
        const comment = replyComment[decisionId]?.[parentCommentId]?.trim();
        if (!comment) {
            return toast.error('Comment cannot be empty');
        }

        try {
            
            await replyToComment({ groupId, parentCommentId,commentText: comment, decisionId ,groupId});
            const decisionDetails = decisions.find((d) => d.decision_id === decisionId);
            if (!decisionDetails) {
                throw new Error('Decision details not found');
            }
            await mailToDecisionCircleReplyComment(decisionDetails,parentCommentId,reply,groupId);
            console.log('Sending email with:', decisionDetails,parentCommentId);
            toast.success('Comment posted and email sent successfully');
            fetchComments(groupId, decisionId);
        } catch (error) {
            toast.error('Error sending email');
            console.error('Error sending email:', error);
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

    const handleReplyInputChange = (decisionId,parentCommentId, value) => {
        setReplyComment(prev => ({ ...prev, 
            [decisionId]:{
                ...prev[decisionId],
            [parentCommentId]:value
        }
        }));
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
                                        <Typography variant="body2" className="mt-2">
                                            <b>Reasons:</b>
                                        </Typography>
                                        <ul>
                                            {decision.reasons && decision.reasons.length > 0 ? (
                                                decision.reasons.map((reason, index) => (
                                                    <li key={index}>
                                                        <Typography variant="body2">{reason}</Typography>
                                                    </li>
                                                ))
                                            ) : (
                                                <Typography variant="body2">No reasons provided.</Typography>
                                            )}
                                        </ul>
                                        <Typography variant="body2">
                                            <b>Selected Tags:</b> {decision.tags && decision.tags.map(tag => tag.tag_name).join(', ')}
                                        </Typography>
                                        <Typography variant='h6'>Shared by: {decision.shared_by}</Typography>

                                        <h6 className='mt-3'>Comments:</h6>
                                        <div className="comments-section">
                                            {comments[decision.decision_id] && comments[decision.decision_id].length > 0 ? (
                                                comments[decision.decision_id].map(comment => (
                                                    <div
                                                        key={comment.id}
                                                        className={`comment-box ${comment.parentCommentId ? 'reply-comment' : 'original-comment'}`}
                                                        style={{
                                                            backgroundColor: comment.parentCommentId ? '#e8f5e9' : '#FFF',
                                                            textAlign: comment.parentCommentId ? 'right' : 'left',
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            marginBottom: '16px',
                                                            position: 'relative',
                                                            border: '1px solid #ccc',
                                                        }}
                                                    >
                                                        <Typography>{comment.comment}</Typography>
                                                        <div className="comment-content" style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                                            <Avatar sx={{ bgcolor: "#526D82", color: "white", marginRight: 2 }}>
                                                                {comment.displayname[0]}
                                                            </Avatar>
                                                            <div>
                                                                <Typography variant="caption">
                                                                    {comment.displayname} | {comment.email} |
                                                                    {comment.created_at === comment.updated_at
                                                                        ? <span> {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}</span>
                                                                        : <span>Edited {formatDistanceToNow(parseISO(comment.updated_at), { addSuffix: true })}</span>}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: comment.parentCommentId ? 'flex-end' : 'flex-start', marginTop: '8px', gap: '10px' }}>
                                                            <input
                                                                type="text"
                                                                className="comment-input"
                                                                placeholder="Reply  to this comment..."
                                                                value={replyComment[decision.decision_id]?.[comment.id] || ''}
                                                                onChange={(e) => handleReplyInputChange(decision.decision_id,comment.id, e.target.value)}
                                                                style={{ width: '60%', fontSize: '12px', marginRight: '8px' }}
                                                                // style={{ flexGrow: 1, padding:'8px' }}
                                                            />
                                                            <button
                                                                className="reply-button"
                                                                onClick={() => handleReplyComment(decision.decision_id, comment.id)}>
                                                                Reply
                                                            </button>
                                                            <button
                                                                className="reply-button"
                                                                onClick={() => handleMailToReplyComment(decision.decision_id,comment.id, true)}>
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
                        <Typography style={{marginTop:'15px',marginLeft:'25px',padding:'5px'}} variant="body2">No decisions available.</Typography>
                    )}
                </Grid>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ShowUsers;
