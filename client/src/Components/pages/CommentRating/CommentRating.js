import React, { useEffect, useState } from 'react';
import { Rating } from '@mui/material';
import './CommentRating.css';
import axios from 'axios';
import { Edit, Visibility } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

function CommentRating({ commentId }) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditable, setIsEditable] = useState(true);

  const fetchCommentRating = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/commentRating/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.commentsRatings?.length > 0) {
        setRating(response.data.commentsRatings[0].rating_score);
        setIsEditable(false);
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const postCommentRating = async (ratingScore) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/commentRating`,
        {
          comment_id: commentId,
          rating_score: ratingScore,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRating(ratingScore);
      setMessage('Rating submitted successfully.');
      setIsSubmitted(true);
      setIsEditable(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      setMessage('An error occurred while submitting the rating.');
    }
  };

  useEffect(() => {
    fetchCommentRating();
  }, [commentId]);

  const handleRatingChange = (event, ratingValue) => {
    if (isEditable) {
      setRating(ratingValue);
      postCommentRating(ratingValue);
    }
  };

  const handleEditClick = () => {
    navigate(`/commentRating/edit/${commentId}`);
  };

  return (
    <div className="commentRating">
      <div style={{ display: 'flex', gap: '30px' }}>
        {!isEditable && (
          <div onClick={handleEditClick}>
            <Edit style={{ fontSize: '18px', cursor: 'pointer' }} />
          </div>
        )}
        <Link to={`/commentRating/overAll/${commentId}`}>
          <Visibility style={{ fontSize: '18px' }} />
        </Link>
      </div>
      <Rating
        name="comment-rating"
        value={rating}
        onChange={handleRatingChange}
        readOnly={!isEditable} 
        onMouseEnter={() => setMessage('')} 
        size="small" 
      />

      {isSubmitted && <p className="success-message">{message}</p>}
      {!isSubmitted && message && <p className="error-message">{message}</p>}
    </div>
  );
}

export default CommentRating;
