import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './View.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { checkInnerCircleExists, getInnerCircleDetails } from '../../Group/Network_Call';
import { useNavigate } from 'react-router-dom';
import ShareModal from '../../Group/ShareModel';


const View = () => {
    const [decision, setDecision] = useState({});
    const { id } = useParams();
    const [innerGroup, setInnerGroup] = useState();
    const [showModal, setShowModal] = useState(false);
    const [innerCircleDetails, setInnerCircleDetails] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const innerGroupCheck = async () => {
            const innerGroup = await checkInnerCircleExists();
            console.log("inner group", innerGroup);
            setInnerGroup(innerGroup);
        };
        innerGroupCheck();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/details/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const responseData = response.data;
                if (responseData && responseData.decisions && responseData.decisions.length > 0) {
                    const { decision_name, decision_due_date, decision_taken_date, user_statement, user_id, tags, decision_reason_text } = responseData.decisions[0];
                    const formattedDecisionDueDate = decision_due_date ? new Date(decision_due_date).toISOString().split('T')[0] : '';
                    const formattedDecisionTakenDate = decision_taken_date ? new Date(decision_taken_date).toISOString().split('T')[0] : '';
                    setDecision({
                        decision_name,
                        decision_due_date: formattedDecisionDueDate,
                        decision_taken_date: formattedDecisionTakenDate,
                        user_statement,
                        user_id,
                        tagsArray: tags,
                        decision_reason_text: decision_reason_text.map(reasonObj => reasonObj.decision_reason_text),
                    });
                } else {
                    console.error("Invalid response format:", responseData);
                }
            } catch (error) {
                console.error("Error fetching decision data:", error.message);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const fetchInnerCircleDetails = async () => {
            if (innerGroup) {
                try {
                    const details = await getInnerCircleDetails();
                    setInnerCircleDetails(details);
                } catch (error) {
                    console.error("Failed to fetch inner circle details", error);
                }
            }
        };

        fetchInnerCircleDetails();
    }, [innerGroup]);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleShare = () => {
        setShowModal(true);
    };

    return (
        <div>
            <div className='header'>
                <h3>Our Decision Details</h3>
            </div>
            <div className='views'>
                <div className='cards'>
                    <strong>Decision Name:</strong>
                    <span>{decision.decision_name}</span>
                    <br />
                    <br />
                    <strong>Decision Details:</strong>
                    <span>{decision.user_statement}</span>
                    <br />
                    <br />
                    <strong>Decision Reasons:</strong>
                    <span>{decision.decision_reason_text && decision.decision_reason_text.join(', ')}</span>
                    <br />
                    <br />
                    <strong>Decision Due Date:</strong>
                    <span>{decision.decision_due_date}</span>
                    <br />
                    <br />
                    <strong>Decision Taken Date:</strong>
                    <span>{decision.decision_taken_date}</span>
                    <br />
                    <br />
                    <strong>Selected Tags:</strong>
                    <span>{decision.tagsArray && decision.tagsArray.join(', ')}</span>
                    <br />
                    <br />
                    <Link to='/readd'>
                        <button className='btn-back'>Go back</button>
                    </Link>
                    <div style={{ margin: "2rem", backgroundColor: "#526D82", borderRadius: "1rem", padding: "0.5rem", display: "flex", justifyContent: "center" }}>
                        {innerGroup ? (
                            <span style={{ color: "white", textDecoration: "none", cursor: "pointer" }} onClick={handleShare}>
                                Share The Above Decision in Inner Circle
                            </span>
                        ) : (
                            <span style={{ color: "white", textDecoration: "none", cursor: "pointer" }} onClick={handleShow}>
                                Create Inner Circle to share this Decision
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <ShareModal 
                showModal={showModal} 
                handleClose={handleClose} 
                innerGroup={innerGroup} 
                innerCircleDetails={innerCircleDetails} 
                decision={decision} 
                id={id} 
            />
        </div>
    );
};

export default View;