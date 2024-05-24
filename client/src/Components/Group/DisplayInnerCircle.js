import React, { useEffect, useState } from 'react';
import { getInnerCircleDetails, removeMemberFromInner, getAddMemberNameListFetch, addMemberToInnerCircle } from './Network_Call';
import { Container, Row, Col, ListGroup, Button, Spinner, Card, Alert } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import ShareModal from '../Group/ShareModel';

const DisplayInnerCircle = () => {
    const [innerCircleDetails, setInnerCircleDetails] = useState(null);
    const [potentialMembers, setPotentialMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const fetchInnerCircleDetails = async () => {
            try {
                const details = await getInnerCircleDetails();
                console.log("detailssss", details);
                setInnerCircleDetails(details);
            } catch (error) {
                console.error("Failed to fetch inner circle details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInnerCircleDetails();
    }, []);

    useEffect(() => {
        const fetchPotentialMembers = async () => {
            try {
                if (innerCircleDetails) {
                    const existingMemberIds = innerCircleDetails.members?.map(member => member.user_id) || [];
                    const membersList = await getAddMemberNameListFetch(existingMemberIds);

                    
                    setPotentialMembers(membersList.result);
                }
            } catch (error) {
                console.error("Failed to fetch potential members list", error);
            }
        };

        if (innerCircleDetails) {
            fetchPotentialMembers();
        }
    }, [innerCircleDetails]);

    const handleRemoveMember = async (userId) => {
        try {
            await removeMemberFromInner(userId, innerCircleDetails.group.id);
            toast("Removed Successfully");
            setInnerCircleDetails(prevDetails => ({
                ...prevDetails,
                members: prevDetails.members.filter(member => member.user_id !== userId)
            }));
        } catch (error) {
            console.error("Failed to remove member", error);
        }
    };

    const handleAddMember = async (userId) => {
        try {
            await addMemberToInnerCircle(userId, innerCircleDetails.group.id);
            toast("Added Successfully");
            const updatedDetails = await getInnerCircleDetails();
            setInnerCircleDetails(updatedDetails);
            setPotentialMembers(prev => prev.filter(member => member.user_id !== userId));
        } catch (error) {
            console.error("Failed to add member", error);
        }
    };

    useEffect(() => {
        if (innerCircleDetails && innerCircleDetails.error) {
            if (innerCircleDetails.error === "No members found for this group") {
                setErrorMessage("No members in this inner circle");
            } else if (innerCircleDetails.error === "No groups found for this user") {
                setErrorMessage("Inner Circle is Not Created yet");
            }
        }
    }, [innerCircleDetails]);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const getVariant = (status) => {
        switch (status) {
            case 'Accepted':
                return 'success';
            case '':
                return 'warning';
            default:
                return '';
        }
    };

    console.log("inner", innerCircleDetails);

    return (
        <div style={{ minWidth: "50rem", margin: "5rem" }}>
            <Card>
                <Card.Body>
                    <Card.Title>Inner Circle Details</Card.Title>
                    <br />
                    {errorMessage && errorMessage !== "No members in this inner circle" && (
                        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
                            <span>{errorMessage}</span>
                            <button
                                onClick={handleShow}
                                style={{
                                    marginLeft: 'auto',
                                    backgroundColor: isHovered ? '#ffffff' : '#526D82',
                                    color: isHovered ? '#000000' : '#ffffff',
                                    padding: "0.5rem",
                                    borderRadius: "0.5rem",
                                    border: "none"
                                }}
                                variant="light"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                Create Inner Circle
                            </button>
                        </Alert>
                    )}
                    <Row>
                        {loading ? (
                            <Container className="text-center">
                                <Spinner animation="border" />
                                <p>Loading...</p>
                            </Container>
                        ) : (
                            (!errorMessage || errorMessage === "No members in this inner circle" ) && innerCircleDetails && (
                                <>
                                    <Col>
                                        <h5>Members:</h5>
                                        <ListGroup>
                                            {innerCircleDetails.members && innerCircleDetails.members.length > 0 ? (
                                                innerCircleDetails.members.map(member => (
                                                    <ListGroup.Item
                                                        key={member.user_id}
                                                        variant={getVariant(member.status)}
                                                    >
                                                        {member.displayname} ({member.email}) - {member.status === "Accepted" ? "Accepted" :"Not Accepted"}
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="float-right"
                                                            onClick={() => handleRemoveMember(member.user_id)}
                                                            style={{ margin: '1rem' }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </ListGroup.Item>
                                                ))
                                            ) : (
                                                <ListGroup.Item>No members found</ListGroup.Item>
                                            )}
                                        </ListGroup>
                                    </Col>
                                    <Col>
                                        <h5>Add Member:</h5>
                                        <ListGroup>
                                            {potentialMembers.map(member => (
                                                <ListGroup.Item key={member.user_id}>
                                                    {member.displayname} ({member.email})
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="float-right"
                                                        onClick={() => handleAddMember(member.user_id)}
                                                        style={{ margin: '1rem' }}
                                                    >
                                                        Add
                                                    </Button>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Col>
                                </>
                            )
                        )}
                    </Row>
                </Card.Body>
            </Card>

            <ShareModal
                showModal={showModal}
                handleClose={handleClose}
                innerGroup={null}
                innerCircleDetails={null}
                decision={null}
                id={null}
            />

            <ToastContainer />
        </div>
    );
};

export default DisplayInnerCircle;
