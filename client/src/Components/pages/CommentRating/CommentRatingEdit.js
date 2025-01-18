import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Rating } from '@mui/material';
import './CommentRatingView.css';

const CommentRatingEdit = () => {
  const { commentId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
      setError('Failed to fetch the current rating.');
    }
  };

  const handleRatingUpdate = async (ratingValue) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/commentRating/edit/${commentId}`,
        { rating_score: ratingValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('Rating updated successfully.');
      setTimeout(() => {
        navigate(`/commentRating/overAll/${commentId}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating rating:', error);
      setMessage('An error occurred while updating the rating.');
    }
  };

  const handleRatingChange = (event, newValue) => {
    setRating(newValue); 
    handleRatingUpdate(newValue); 
  };

  useEffect(() => {
    fetchCommentRating();
  }, [commentId]);

  if (error) return <div>{error}</div>;

  return (
    <div className="commentRate-reviews">
      <h4>Edit Comment-Rating</h4>
      {message && <p>{message}</p>}
      <div>
        <label htmlFor="rating">Rating:</label>
        <Rating
          name="comment-rating"
          value={rating}
          onChange={handleRatingChange}
        />
      </div>
    </div>
  );
};

export default CommentRatingEdit;
