import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Alert, Row, Col, Button } from 'react-bootstrap';
import { getAcceptNotification, updateNotificationStatus } from '../../Components/Group/Network_Call';
import { ToastContainer, toast } from 'react-toastify';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);

    const getInnerCircleAcceptInvitation = async () => {
        try {
            const response = await getAcceptNotification();
            console.log("response from notification", response);
            const combinedNotifications = [...response.sharedDecisionsWithDetails, ...response.creatorDetails];
            setNotifications(combinedNotifications);
        } catch (error) {
            console.error('Error in fetching the Inner Circle Notification:', error);
            toast.error('An error occurred while fetching the Inner Circle Notification');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateNotificationStatus(id, newStatus);
            setNotifications((prevNotifications) => 
                prevNotifications.map((notification) =>
                    notification.id === id ? { ...notification, status: newStatus } : notification
                )
            );
            toast.success(`Notification status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating notification status:', error);
            toast.error('An error occurred while updating the notification status');
        }
    };

    useEffect(() => {
        getInnerCircleAcceptInvitation();
    }, []);

    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <Row className="justify-content-center">
                <Col>
                    {notifications.length > 0 ? (
                        <Card>
                            <ListGroup variant="flush">
                                {notifications.map((notification) => (
                                    <ListGroup.Item key={notification.id}>
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <strong>Shared By:</strong> {notification.displayname}<br />
                                                <strong>Email:</strong> {notification.email}<br />
                                                {notification.decisionDetail && (
                                                    <>
                                                        <strong>Decision Name:</strong> {notification.decisionDetail.decision_name}<br />
                                                        <strong>Decision Reason:</strong> {notification.decisionDetail.decision_reason || 'N/A'}<br />
                                                        <strong>Creation Date:</strong> {new Date(notification.decisionDetail.creation_date).toLocaleDateString()}<br />
                                                        <strong>Due Date:</strong> {new Date(notification.decisionDetail.decision_due_date).toLocaleDateString()}<br />
                                                        <strong>Taken Date:</strong> {new Date(notification.decisionDetail.decision_taken_date).toLocaleDateString()}<br />
                                                        <strong>User Statement:</strong> {notification.decisionDetail.user_statement}
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-end">
                                                <span className={`badge ${notification.status === 'Accepted' ? 'bg-success' : 'bg-danger'}`}>
                                                    {notification.status}
                                                </span>
                                                <div className="mt-2">
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleStatusChange(notification.id, 'Accepted')}
                                                    >
                                                        Accept
                                                    </Button>{' '}
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleStatusChange(notification.id, 'Not Accepted')}
                                                    >
                                                        Not Accept
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                    ) : (
                        <Alert variant="info" className="text-center">
                            No notifications available.
                        </Alert>
                    )}
                    <ToastContainer />
                </Col>
            </Row>
        </div>
    );
};

export default Notification;
