import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BiSolidSmile } from "react-icons/bi";
import './EmojiReaction.css';
import { MdDelete } from "react-icons/md";
import { ToastContainer, toast } from 'react-toastify';
import withAuth from '../../../withAuth';

function EmojiReaction({ commentId }) {
    const [emojis, setEmojis] = useState([]);
    const [showEmojis, setShowEmojis] = useState(false);
    const [reactions, setReactions] = useState([]);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    const fetchMasterEmoji = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/masterEmoji`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEmojis(response.data.emojis);
            // console.log('Fetched emojis:', response.data.emojis);
        } catch (error) {
            console.error('Error fetching emojis:', error);
        }
    };


    const fetchCurrentUserEmail = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.status === 200 && response.data.tasks.length > 0) {
                const email = response.data.tasks[0].email;
                setCurrentUserEmail(email);
            } else {
                console.error('User details not found');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };


    const fetchEmoji = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/emoji/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setReactions(response.data.data);
            console.log('Fetched reactionsaaa:', response.data.data);
        } catch (error) {
            console.log("fetch decision emoji's:", error);
        }
    }


    const postReaction = async (emoji_id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/emoji`,
                { comment_id: commentId, emoji_id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Reaction added:', response.data);
            toast.success("Reaction Added Successfully");
            setReactions((prev) => [...prev, response.data]);
            fetchEmoji();
        } catch (error) {
            console.error('Failed to add reaction:', error);
        }
    };

    const removeReaction = async (emoji_id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/emoji/${commentId}/${emoji_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Reaction Removed Successfully");
            fetchEmoji(); // Refresh reactions
        } catch (error) {
            if (error.response?.status === 404) {
                toast.error("Reaction not found or already removed");
            } else {
                toast.error("Failed to remove reaction");
            }
            console.error('Failed to remove reaction:', error);
        }
    };
    

    useEffect(() => {
        fetchMasterEmoji();
        fetchCurrentUserEmail();
        fetchEmoji();
    }, []);


    const toggleEmojiVisibility = () => {
        setShowEmojis(!showEmojis);
    };

    return (
        <div>

            {showEmojis && (
                <div className="emoji-line">
                    {emojis.length > 0 ? (
                        emojis.map((emoji) => (
                            <span
                                key={emoji.emoji_id}
                                className="emoji"
                                onClick={() => postReaction(emoji.emoji_id)}
                            >
                                {emoji.emoji_symbol}
                            </span>
                        ))
                    ) : (
                        <p>No emojis available</p>
                    )}
                </div>
            )}

            <BiSolidSmile className="smile-emoji" onClick={toggleEmojiVisibility} />

            {reactions.length > 0 && (
                <div className="reaction-list">
                    <p>Reactions:</p>
                    <ul className="reaction-ul">
                        {reactions.map((reaction) => (
                            <li key={reaction.reaction_id} className="reaction-li">
                                <span className="emoji">{reaction.emoji_symbol}</span>
                                <span >{reaction.displayname}</span>
                                    {reaction.email === currentUserEmail && (
                                        <MdDelete
                                            className="delete-icon"
                                            onClick={() => removeReaction(reaction.emoji_id)}
                                        />
                                    )}
                                {/* <span className="emoji-name">{reaction.emoji_name}</span> */}
                                {/* <span className="reacted-at">{new Date(reaction.reacted_at).toLocaleString()}</span> */}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <ToastContainer />
        </div>
    );
}

export default withAuth(EmojiReaction);
