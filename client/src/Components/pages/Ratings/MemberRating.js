// import React, { useEffect, useState } from 'react';
// import { FaRegStar, FaStar } from "react-icons/fa6";
// import axios from 'axios';
// import { GrEdit } from "react-icons/gr";
// import './MemberRating.css';

// const MemberRating = ({ decisionId }) => {
//     const [rating, setRating] = useState(0);
//     const [hover, setHover] = useState(0);
//     const [message, setMessage] = useState('');
//     const [ratingId, setRatingId] = useState(null); 

//     useEffect(() => {
//         const fetchRating = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/rating/${decisionId}`, {
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     }
//                 });
//                 if (response.data.ratings && response.data.ratings.length > 0) {
//                     const userRating = response.data.ratings[0];
//                     setRating(userRating.rating_score);
//                     setRatingId(userRating.id); 
//                 }
//                 console.log("assssa", response.data);
//             } catch (error) {
//                 console.error('Error fetching data:', error.message);
//             }
//         }
//         fetchRating();
//     }, [decisionId]);

//     const postRating = async (ratingScore) => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/rating`,
//                 {
//                     decision_id: decisionId,
//                     rating_score: ratingScore,
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );
//             setMessage('Rating submitted successfully.');
//         } catch (error) {
//             console.error('Error submitting rating:', error);
//             setMessage('An error occurred while submitting the rating.');
//         }
//     };

//     const handleStarClick = (ratingValue) => {
//         setRating(ratingValue);
//         postRating(ratingValue);
//     };

//     const getRatingLevel = (ratingValue) => {
//         switch (ratingValue) {
//             case 1:
//                 return 'Below Average Decision';
//             case 2:
//                 return 'Needs Improvement';
//             case 3:
//                 return 'Neutral Decision';
//             case 4:
//                 return 'Positive Decision';
//             case 5:
//                 return 'Excellent Decision';
//             default:
//                 return 'Not a good decision';
//         }
//     };


//     return (
//         <div className="rate-reviews">
//             <h6>Rate / Reviews</h6>
//             <div className='rate-stars'>
//                 <div className="stars">
//                     {[1, 2, 3, 4, 5].map((star) => (
//                         <span
//                             key={star}
//                             className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
//                             onClick={() => handleStarClick(star)}
//                             onMouseEnter={() => setHover(star)}
//                             onMouseLeave={() => setHover(0)}
//                         >
//                             {star <= (hover || rating) ? <FaStar /> : <FaRegStar />}
//                         </span>
//                     ))}
//                 </div>
//                 <div>
//                     <GrEdit />
//                 </div>
//             </div>

//             <p className="rating-level">{getRatingLevel(rating)}</p>
//             {message && <p className="message">{message}</p>}
//         </div>
//     );
// };

// export default MemberRating;


import React, { useEffect, useState } from 'react';
import { FaRegStar, FaStar } from "react-icons/fa6";
import axios from 'axios';
import { GrEdit } from "react-icons/gr";
import './MemberRating.css';
import {useNavigate} from 'react-router-dom';

const MemberRating = ({ decisionId }) => {
    const navigate = useNavigate();  
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [message, setMessage] = useState('');
    const [ratingId, setRatingId] = useState(null); 
    const [isEditable,setIsEditable] = useState(true);
    const [ratingDate, setRatingDate] = useState(''); 

    useEffect(() => {
        const fetchRating = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/rating/${decisionId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data.ratings && response.data.ratings.length > 0) {
                    const userRating = response.data.ratings[0];
                    setRating(userRating.rating_score);
                    setRatingId(userRating.id);
                    setRatingDate(new Date(userRating.rating_date).toLocaleString()); 
                    setIsEditable(false); 
                }
                console.log("assssa", response.data);
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        }
        fetchRating();
    }, [decisionId]);

    const postRating = async (ratingScore) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/rating`,
                {
                    decision_id: decisionId,
                    rating_score: ratingScore,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMessage('Rating submitted successfully.');
            setIsEditable(false);
        } catch (error) {
            console.error('Error submitting rating:', error);
            setMessage('An error occurred while submitting the rating.');
        }
    };

    const handleStarClick = (ratingValue) => {
        if(isEditable) {
        setRating(ratingValue);
        postRating(ratingValue);
        }
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


    const handleEditClick = () => {
        navigate(`/rating/edit/${decisionId}`); 
    };


    return (
        <div className="rate-reviews">
            <h6>Rate / Reviews</h6>
            <div className='rate-stars'>
                <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
                            onClick={() => isEditable && handleStarClick(star)}
                            onMouseEnter={() => isEditable && setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            {star <= (hover || rating) ? <FaStar /> : <FaRegStar />}
                        </span>
                    ))}
                </div>
                <div onClick={handleEditClick}>
                    <GrEdit />
                </div>
            </div>

            <p className="rating-level">{getRatingLevel(rating)}</p>
            {message && <p className="message">{message}</p>}

            {ratingDate && <p>Updated Time: {ratingDate}</p>}
        </div>
    );
};

export default MemberRating;
