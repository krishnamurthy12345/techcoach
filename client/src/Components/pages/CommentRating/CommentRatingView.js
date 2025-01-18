import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaStar } from "react-icons/fa";
import './CommentRatingView.css';

const CommentRatingView = () => {
  const [averageRating, setAverageRating] = useState(null);
  const [individualRatings, setIndividualRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { commentId } = useParams();


  const fetchRating = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/commentRating/overAll/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { averageRating, ratings } = response.data;
      setAverageRating(averageRating);
      setIndividualRatings(ratings);
      console.log('overallComment', response.data);
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError('Failed to load ratings.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchRating();
  }, [commentId]);


  const renderStars = (score) => {
    const totalStars = 5;
    return Array.from({ length: totalStars }, (_, index) => (
      <FaStar
        key={index}
        className={index < score ? "filled-star" : "empty-star"}
      />
    ));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="commentRating-overAll">
      {averageRating && (
        <div className="commentRating-average">
          <h4>Overall Comment Rating</h4>
          <div className="stars">{renderStars(Math.round(averageRating))}</div>
          <p className='rating-point'>{averageRating} / 5</p>
        </div>
      )}

      {individualRatings.length > 0 ? (
        <div className="commentRating-individual">
          <h6>Individual Ratings:</h6>
          <ul>
            {individualRatings.map((rating, index) => (
              <li key={index}>
                <p><strong>Group User's:</strong> {rating.displayName || "Anonymous"}</p>
                <div className="stars">{renderStars(rating.score)}</div>
                <p>Rating: {rating.score} / 5</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No individual ratings available.</p>
      )}


    </div>
  );
};

export default CommentRatingView
