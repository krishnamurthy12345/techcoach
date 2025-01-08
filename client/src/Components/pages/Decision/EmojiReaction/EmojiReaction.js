import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BiSolidSmile } from "react-icons/bi";
import './EmojiReaction.css';

function EmojiReaction({ commentId }) {
    const [emojis, setEmojis] = useState([]);
    const [showEmojis, setShowEmojis] = useState(false);
    const [reactions, setReactions] = useState([]);

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
            setReactions((prev) => [...prev, response.data]);
            fetchEmoji();
        } catch (error) {
            console.error('Failed to add reaction:', error);
        }
    };

    useEffect(() => {
        fetchMasterEmoji();
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
                            <li key={reaction.reaction_id} className="reaction-li" >
                                <span className="emoji">{reaction.emoji_symbol}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

        </div>
    );
}

export default EmojiReaction;
