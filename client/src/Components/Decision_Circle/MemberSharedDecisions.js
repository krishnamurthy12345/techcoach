import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { getMemberSharedDecisions, mailToDecisionCirclePostComment, postComment, getComments, deleteComment } from './Networkk_Call';
import { Card, CardContent, Typography, Grid, Avatar, CircularProgress } from '@mui/material';
import axios from 'axios';
import { AiFillEdit } from "react-icons/ai";
import { MdOutlineDeleteForever } from "react-icons/md";
import './GetGroup.css';
import './CommentStyle.css';
import { formatDistanceToNow, parseISO } from 'date-fns';

const MemberSharedDecisions = () => {
    const [groups, setGroups] = useState(null);
    const [decisions, setDecisions] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [buttonLoading, setButtonLoading] = useState({});

    const { groupId } = useParams();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const groupName = params.get('group_name');

    useEffect(() => {
        if (groupId) {
            fetchGroupDetails();
            fetchSharedDecisions();
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
                setMembers(response.data.members);
            }
        } catch (err) {
            toast.error('An error occurred while fetching the group details.');
            console.error(err);
        }
    };

    const fetchSharedDecisions = async () => {
        try {
            const data = await getMemberSharedDecisions(groupId);
            setDecisions(data || []);
            data.forEach((decision) => fetchComments(groupId, decision.decision_id));
            console.log(data,'ssssss');
        } catch (error) {
            setError('Failed to fetch shared decisions.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async (decisionId, memberId) => {
        try {
            if (buttonLoading[decisionId]) return;
            setButtonLoading(prevState => ({ ...prevState, [decisionId]: true }));
            if (!newComment.trim()) {
                return toast.error('Comment cannot be empty');
            }

            const memberExists = members.some(member => member.user_id === memberId);
            if (!memberExists) {
                return toast.error('Invalid member ID');
            }

            await postComment(newComment, groupId, decisionId, memberId);
            setNewComment('');
            toast.success('Comment posted successfully');

            fetchComments(groupId, decisionId);
        } catch (error) {
            toast.error('Error posting comment');
            console.error('Error posting comment:', error);
        } finally {
            setButtonLoading(prevState => ({ ...prevState, [decisionId]: false })); 
        }
    };

    const handlemailToPostComment = async (decisionId, memberId, email, withEmail = false) => {
        try {
            setButtonLoading(prevState => ({ ...prevState, [decisionId + '_email']: true }));

            // Ensure a comment is present
            if (!newComment.trim()) {
                return toast.error('Comment cannot be empty');
            }

            // Post comment first
            await handlePostComment(decisionId, memberId);
            toast.success('Comment posted successfully');

            if (withEmail) {
                const decisionDetails = decisions.find(d => d.decision_id === decisionId).decisionDetails;
                const responseToPostComment = await mailToDecisionCirclePostComment(decisionDetails, memberId, newComment, email);
                toast.success('Email sent successfully');
                console.log('Response from email API:', responseToPostComment);

            }
            fetchComments(groupId, decisionId);
        } catch (error) {
            console.error('Error posting comment and sending email:', error);
            toast.error('Error sending email');
        } finally {
            setButtonLoading(prevState => ({ ...prevState, [decisionId + '_email']: false }));
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

    const handleDeleteComment = async (commentId, decisionId) => {
        try {
            await deleteComment(commentId);
            setComments(prevComments => ({
                ...prevComments,
                [decisionId]: prevComments[decisionId].filter(comment => comment.id !== commentId),
            }));
            toast.success('Comment deleted successfully');
        } catch (error) {
            console.error("Error deleting comment:", error.response?.data);
            toast.error('Error deleting comment');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className='getGroup'>
            {groups && (
                <div className="group-details">
                    <h4>{groupName || groups.group_name}</h4>
                    {members.length > 0 ? (
                        <ul className="group-members">
                            {members.map(member => (
                                <li key={member.user_id}>
                                    {member.displayname} ({member.email})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No members found in this group.</p>
                    )}
                </div>
            )}

            <h6>Shared with Decisions</h6>
            <Grid container spacing={3}>
                {decisions.length > 0 ? (
                    decisions.map((decision) => (
                        <Grid item xs={12} key={decision.decision_id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{decision.decision_name}</Typography>
                                    <Typography variant="body2"><b>Due Date:</b> {decision.decision_due_date ? new Date(decision.decision_due_date).toLocaleDateString() : ''}</Typography>
                                    <Typography variant="body2"><b>Taken Date:</b> {decision.decision_taken_date ? new Date(decision.decision_taken_date).toLocaleDateString() : ''}</Typography>
                                    <Typography variant="body2"><b>Decision Details:</b> {decision.user_statement}</Typography>
                                    <Typography variant="body2"><b>Decision Reasons:</b> {decision.reasons ? decision.reasons.join(', ') : 'No reasons provided'}</Typography>
                                    <Typography variant="body2">
                                        <b>Selected Tags:</b> {decision.tags && decision.tags.map(tag => tag.tag_name).join(', ')}
                                    </Typography>
                                    <Typography variant='h6'><b>Shared With:{decision.shared_by}</b></Typography>
                                    <div className="comments-section">
                                        <h6>Comments:</h6>
                                        {comments[decision.decision_id]?.length > 0 ? (
                                            comments[decision.decision_id].map((comment) => (
                                                <div key={comment.id} className="comment-bubble" style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '8px', backgroundColor: '#edf6fc' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="body1" className="comment-text" style={{ fontWeight: 'bold', flex: 1 }}>
                                                            {comment.comment}
                                                        </Typography>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <AiFillEdit style={{ marginRight: '8px', cursor: 'pointer' }} />
                                                            <MdOutlineDeleteForever
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => handleDeleteComment(comment.id, decision.decision_id)}
                                                            />
                                                        </div>
                                                    </div>
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
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            className='comment-input'
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                        />
                                        <div>
                                            <button
                                                className='comment-submit'
                                                onClick={() => handlePostComment(decision.decision_id, members[0]?.user_id)} disabled={buttonLoading[decision.decision_id]}>
                                                {buttonLoading[decision.decision_id] ? <CircularProgress size={20} /> : 'Post Comment'}
                                            </button>
                                            <button className="comment-submit"
                                                onClick={() => handlemailToPostComment(decision.decision_id, members[0]?.user_id)} disabled={buttonLoading[decision.decision_id]} >
                                                {buttonLoading[decision.decision_id + '_email'] ? <CircularProgress size={24} /> : 'Save and Email'}
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <p>No decisions found for this group.</p>
                )}
            </Grid>
            <ToastContainer />
        </div>
    );
};

export default MemberSharedDecisions;
