import React, { useEffect, useState } from 'react';
import { getInnerCircleDetails, removeMemberFromInner, getAddMemberNameListFetch, addMemberToInnerCircle } from './Network_Call';
import { Container, Row, Col, ListGroup, Button, Spinner, Card, Alert } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import ShareModal from '../Group/ShareModel';
import withAuth from '../withAuth';

const DisplayInnerCircle = () => {
    const [innerCircleDetails, setInnerCircleDetails] = useState(null);
    const [potentialMembers, setPotentialMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [loadingRemove, setLoadingRemove] = useState({});

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
        setLoadingRemove(prev => ({ ...prev, [userId]: true }));
        try {
            await removeMemberFromInner(userId, innerCircleDetails.group.id);
            toast("Removed Successfully");
            setInnerCircleDetails(prevDetails => ({
                ...prevDetails,
                members: prevDetails.members.filter(member => member.user_id !== userId)
            }));
        } catch (error) {
            console.error("Failed to remove member", error);
        } finally {
            setLoadingRemove(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleAddMember = async (userId) => {
        setLoadingAdd(true);
        try {
            await addMemberToInnerCircle(userId, innerCircleDetails.group.id);
            toast("Added Successfully");
            const updatedDetails = await getInnerCircleDetails();
            setInnerCircleDetails(updatedDetails);
            setPotentialMembers(prev => prev.filter(member => member.user_id !== userId));
        } catch (error) {
            console.error("Failed to add member", error);
        } finally {
            setLoadingAdd(false);
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

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    console.log("inner", innerCircleDetails);

    return (
        <div style={{ margin: "1rem" }}>
        <Card style={{
        maxWidth: "85rem",
        margin: "2rem auto",
        transform: isHovered ? 'scale(1)' : 'none'
    }}>
            <Card.Body>
                <Card.Title>Inner Circle Details</Card.Title>
                <br />
                {errorMessage && errorMessage !== "No members in this inner circle" && (
                    <Alert variant="danger">
                        {errorMessage}
                        <button
                            onClick={handleShow}
                            style={{ backgroundColor: '#526D82', color: '#ffffff', padding: "0.5rem", borderRadius: "0.5rem", border: "none", width: "100%", marginTop: "1rem" }}
                        >
                            Create Inner Circle
                        </button>
                    </Alert>
                )}
                {loading ? (
                    <Container className="text-center">
                        <Spinner animation="border" />
                        <p>Loading...</p>
                    </Container>
                ) : (
                    (!errorMessage || errorMessage === "No members in this inner circle" ) && innerCircleDetails && (
                        <div>
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
                                                size="sm"
                                                className="float-right"
                                                onClick={() => handleRemoveMember(member.user_id)}
                                                disabled={loadingRemove[member.user_id]}
                                                style={{ margin: '1rem', color:"black", border:"0.1rem solid #DC3545", backgroundColor:"#DC3545", color:"White", padding:"0.5rem" }}
                                            >
                                                {loadingRemove[member.user_id] ? (
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    'Remove'
                                                )}
                                            </Button>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <ListGroup.Item>No members found</ListGroup.Item>
                                )}
                            </ListGroup>
                            <br />
                            <h5>Add Member:</h5>
                            <input
                                type="text"
                                placeholder="Search by email"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                style={{ marginBottom: '1rem' }}
                            />
                            <ListGroup>
                                {potentialMembers.filter(member => member.email === searchQuery).map(member => (
                                    <ListGroup.Item key={member.user_id}>
                                        {member.displayname} ({member.email})
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="float-right"
                                            onClick={() => handleAddMember(member.user_id)}
                                            disabled={loadingAdd}
                                            style={{ margin: '1rem', color:"black", border:"0.1rem solid #DC3545", backgroundColor:"#DC3545", color:"White", padding:"0.5rem" }}
                                        >
                                            {loadingAdd ? (
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                'Add'
                                            )}
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    )
                )}
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
    
export default withAuth(DisplayInnerCircle);