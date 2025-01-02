import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaRegStar, FaStar } from 'react-icons/fa6';
import { useNavigate, useParams } from 'react-router-dom';
import './MemberRating.css';

const EditRating = () => {
    const { decisionId } = useParams();
    const navigate = useNavigate();  
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [message, setMessage] = useState('');
    const [ratingId, setRatingId] = useState(null); 

    useEffect(() => {
        console.log('sedd',decisionId);
        const fetchRating = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/rating/${decisionId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.data.ratings && response.data.ratings.length > 0) {
                    const userRating = response.data.ratings[0];
                    setRating(userRating.rating_score);
                    setRatingId(userRating.id); 
                }
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };
        if (decisionId) fetchRating();
    }, [decisionId]);

    const handleSave = async () => {
        console.log('Saving Rating for Decision ID:', decisionId); 
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/rating/edit/${decisionId}`,
                {
                    rating_score: rating,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Response:', response.data); 
            setMessage('Rating updated successfully.');
            navigate(`/rating/${decisionId}`);
        } catch (error) {
            console.error('Error updating rating:', error);
            setMessage('An error occurred while updating the rating.');
        }
    };

    const handleStarClick = (ratingValue) => {
        setRating(ratingValue);
    };

    const getRatingLevel = (ratingValue) => {
        switch (ratingValue) {
            case 1:
                return 'Below Average Decision';
            case 2:
                return 'Needs Improvement';
            case 3:
                return 'Neutral Decision';
            case 4:
                return 'Positive Decision';
            case 5:
                return 'Excellent Decision';
            default:
                return 'Not a good decision';
        }
    };

    return (
        <div className="rate-reviews">
            <h2>Edit Rating</h2>
            <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                    >
                        {star <= (hover || rating) ? <FaStar /> : <FaRegStar />}
                    </span>
                ))}
            </div>
            <p className="rating-level">{getRatingLevel(rating)}</p>
            <button onClick={handleSave}>Save</button>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default EditRating;
