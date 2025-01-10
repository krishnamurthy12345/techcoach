import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Rating.css';
import { FaStar } from "react-icons/fa";
import withAuth from '../../withAuth';

const Rating = () => {
    const [data, setData] = useState(null);
    const [averageRating, setAverageRating] = useState(null);
    const [individualRatings, setIndividualRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/getInfo_Referred/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const responseData = response.data;

            if (responseData?.decisionData?.length > 0) {
                const {
                    decision_name,
                    decision_due_date,
                    decision_taken_date,
                    user_statement,
                    tags,
                    decision_reason,
                } = responseData.decisionData[0];

                setData({
                    decision_name,
                    decision_due_date: new Date(decision_due_date).toLocaleDateString(),
                    decision_taken_date: new Date(decision_taken_date).toLocaleDateString(),
                    user_statement,
                    tags: tags || [],
                    decision_reason: decision_reason || [],
                });
            } else {
                console.log('No decision data found');
            }
        } catch (error) {
            console.error('Error fetching the decision data:', error);
        }
    };


    const fetchRating = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/rating/overall/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const { averageRating, ratings } = response.data;
            setAverageRating(averageRating);
            setIndividualRatings(ratings);
            console.log('overall', response.data);
        } catch (err) {
            console.error('Error fetching ratings:', err);
            setError('Failed to load ratings.');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (score) => {
        const totalStars = 5;
        return Array.from({ length: totalStars }, (_, index) => (
            <FaStar
                key={index}
                className={index < score ? "filled-star" : "empty-star"}
            />
        ));
    };

    useEffect(() => {
        fetchRating();
        fetchData();
    }, [id]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="rating-container">
            {averageRating && (
                <div className="average-rating">
                    <h4>Overall Rating</h4>
                    <div className="stars">{renderStars(Math.round(averageRating))}</div>
                    <p className='rating-point'>{averageRating} / 5</p>
                </div>
            )}

            {individualRatings.length > 0 ? (
                <div className="individual-ratings">
                    <h6>Individual Ratings:</h6>
                    <ul>
                        {individualRatings.map((rating, index) => (
                            <li key={index}>
                                <p><strong>User:</strong> {rating.displayName || "Anonymous"}</p>
                                <div className="stars">{renderStars(rating.score)}</div>
                                <p>Rating: {rating.score} / 5</p>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No individual ratings available.</p>
            )}
            
            {data && (
                <div className="rating-card">
                    <h5>{data.decision_name}</h5>
                    <p><strong>Due Date:</strong> {data.decision_due_date}</p>
                    <p><strong>Taken Date:</strong> {data.decision_taken_date}</p>
                    <p><strong>User Statement:</strong> {data.user_statement}</p>
                    <div>
                        <h6>Tags:</h6>
                        <ul>
                            {data.tags.map((tag, index) => (
                                <li key={index}>{tag.tag_name}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h6>Decision Reasons:</h6>
                        <ul>
                            {data.decision_reason.map((reason, index) => (
                                <li key={index}>{reason.decision_reason_text}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

        </div>
    );
};

export default withAuth(Rating);
