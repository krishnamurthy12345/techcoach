import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './GetAllEmoji.css';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

function GetAllEmoji({ commentId }) {
    const [reactions, setReactions] = useState([]);
    const { id } = useParams();

    const fetchAllEmoji = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/emoji/decision/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setReactions(response.data.data);
            console.log('Fetched reactions:', response.data.data);
        } catch (error) {
            console.log("fetch all decision emoji's:", error);
        }
    };

    const removeReaction = async (emoji_id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/emoji/${commentId}/${emoji_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Reaction removed:', response.data);
            setReactions((prevReactions) =>
                prevReactions.filter((reaction) => reaction.emoji_id !== emoji_id)
            );
            toast.success("Reaction Removed Successfully");
        } catch (error) {
            console.error('Failed to remove reaction:', error);
            toast.error('Failed to remove reaction:', error);
        }
    };

    useEffect(() => {
        fetchAllEmoji();
    }, [commentId]);

    const filteredReactions = reactions.filter(
        (reaction) => reaction.comment_id === commentId
    );

    return (
        <div>
            {reactions.length > 0 && (
                <div className="reactions-all-list">
                    <p>All Reactions:</p>
                    <ul className="reactions-ul">
                        {filteredReactions.map((reaction) => (
                            <li key={reaction.reaction_id} className="reactions-li">
                                <span className="emoji">{reaction.emoji_symbol}</span>
                                <span className="displayname">{reaction.displayname}</span>
                                <button
                                    className="remove-reaction-btn"
                                    onClick={() => removeReaction(reaction.emoji_id)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}

export default GetAllEmoji;
