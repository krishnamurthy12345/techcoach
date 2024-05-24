import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardContent, Avatar, Tooltip, Box } from '@mui/material';
import { acceptOrRejectInnerCircle, getInnerCircleAcceptNotification } from '../../Components/Group/Network_Call';
import { ToastContainer, toast } from 'react-toastify';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [response, setResponse] = useState(null); // State to store the response

    const getNotification = async () => {
        try {
            const response = await getInnerCircleAcceptNotification();
            console.log("response from notification", response);
            setNotifications(response.notAcceptedMembers);
            setResponse(response); // Set the response in state
        } catch (error) {
            console.error('Error in fetching the notifications:', error);
            toast('An error occurred while fetching the notifications');
        }
    };

    const handleAction = async (groupId, status) => {
        try {
            console.log("payload", status);
            await acceptOrRejectInnerCircle(groupId, status);
            toast('Status Updated Successfully');
            getNotification(); // Refresh notifications after action
        } catch (error) {
            console.error(`Error ${status ? 'accepting' : 'rejecting'} notification:`, error);
            toast(`An error occurred while ${status ? 'accepting' : 'rejecting'} the notification`);
        }
    };

    useEffect(() => {
        getNotification();
    }, []);

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : '';
    };

    return (
        <div>
            {notifications.length === 0 ? (
                <Typography variant="h5" style={{ textAlign: "center", marginTop: "1rem", backgroundColor: "aliceblue", padding: "1rem" }}>
                    No notifications
                </Typography>
            ) : (
                notifications.map(notification => (
                    <Card key={notification.id} variant="outlined" style={{ margin: '4rem' }}>
                        <CardContent>
                            {response && response.groupDetails[notification.group_id] && (
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Avatar style={{
                                        backgroundColor:"#526D82"
                                    }}>
                                        {getInitials(response.groupDetails[notification.group_id].userDetails.displayname)}
                                    </Avatar>
                                    <Typography variant="body1" style={{ marginLeft: '10px' }}>
                                        {response.groupDetails[notification.group_id].userDetails.displayname}
                                    </Typography>
                                    <Typography variant="body2" style={{ marginLeft: '10px' }}>
                                        is requesting you to join their inner circle
                                    </Typography>
                                </Box>
                            )}
                            {response && response.acceptedDetails[notification.group_id] && (
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Typography variant="body2" style={{ marginRight: "10px" }}>
                                        Members of that inner circle:
                                    </Typography>
                                    <Box display="flex" alignItems="center">
                                        <Tooltip title={response.acceptedDetails[notification.group_id].userDetails.displayname} key={response.acceptedDetails[notification.group_id].userDetails.user_id}>
                                            <Avatar
                                                alt={response.acceptedDetails[notification.group_id].userDetails.displayname}
                                                src="/static/images/avatar/1.jpg" // replace with actual avatar source if available
                                                style={{ margin: '0 5px',
                                                    backgroundColor:"#526D82"
                                                 }}
                                            />
                                        </Tooltip>
                                    </Box>
                                </Box>
                            )}
                            <Box display="flex" justifyContent="flex-end" gap={3}>
                                <Button variant="contained" color="primary" onClick={() => handleAction(notification.group_id, 'Accepted')}>
                                    Accept
                                </Button>
                                <Button variant="contained" color="error" onClick={() => handleAction(notification.group_id, 'Not Accepted')}>
                                    Reject
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}
            <ToastContainer />
        </div>
    );
};

export default Notification;
