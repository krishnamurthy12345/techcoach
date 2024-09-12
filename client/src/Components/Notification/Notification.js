import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardContent, Avatar, Tooltip, Box } from '@mui/material';
import { acceptOrRejectInnerCircle, getInnerCircleAcceptNotification } from '../../Components/Group/Network_Call';
import { ToastContainer, toast } from 'react-toastify';
import withAuth from '../withAuth';
import { getDecisionCircleAcceptNotification } from '../Decision_Circle/Networkk_Call';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [decisionNotifications, setDecisionNotifications] = useState([]);
    const [response, setResponse] = useState(null); 

    // const getNotification = async () => {
    //     try {
    //         const innerCircleResponse = await getInnerCircleAcceptNotification();
    //         const decisionCircleResponse = await getDecisionCircleAcceptNotification();
    //         console.log("Inner Circle Notifications:", innerCircleResponse);
    //         console.log("Decision Circle Notifications:", decisionCircleResponse);      
    //         setNotifications(innerCircleResponse.notAcceptedMembers.filter(notification => innerCircleResponse.groupDetails[notification.group_id].userDetails));
    //         setDecisionNotifications(decisionCircleResponse.notAcceptedMembers.filter(notification=> decisionCircleResponse.groupDetails[notification.group_id].userDetails));
    //         setResponse(innerCircleResponse); 
    //     } catch (error) {
    //         console.error('Error in fetching the notifications:', error);
    //         toast('An error occurred while fetching the notifications');
    //     }
    // };

    const getNotification = async () => {
        try {
            const innerCircleResponse = await getInnerCircleAcceptNotification();
            const decisionCircleResponse = await getDecisionCircleAcceptNotification();
            
            console.log("Inner Circle Notifications:", innerCircleResponse);
            console.log("Decision Circle Notifications:", decisionCircleResponse);
    
            // Check if notAcceptedMembers and groupDetails exist and are arrays
            const innerCircleNotifications = innerCircleResponse.notAcceptedMembers && Array.isArray(innerCircleResponse.notAcceptedMembers) 
                ? innerCircleResponse.notAcceptedMembers.filter(notification => 
                    innerCircleResponse.groupDetails[notification.group_id] && 
                    innerCircleResponse.groupDetails[notification.group_id].userDetails
                ) 
                : [];
    
            const decisionCircleNotifications = decisionCircleResponse.notAcceptedMembers && Array.isArray(decisionCircleResponse.notAcceptedMembers) 
                ? decisionCircleResponse.notAcceptedMembers.filter(notification => 
                    decisionCircleResponse.groupDetails[notification.group_id] && 
                    decisionCircleResponse.groupDetails[notification.group_id].userDetails
                ) 
                : [];
    
            setNotifications(innerCircleNotifications);
            setDecisionNotifications(decisionCircleNotifications);
            setResponse(innerCircleResponse); 
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
            getNotification();
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
                {/* Inner Circle Notifications */}
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
                                    <Avatar style={{ backgroundColor: "#526D82" }}>
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
                                                src="/static/images/avatar/1.jpg" 
                                                style={{ margin: '0 5px', backgroundColor: "#526D82" }}
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


            {/* Decision Circle Notifications */}
            {decisionNotifications.length === 0 ? (
                <Typography variant="h5" style={{ textAlign: "center", marginTop: "1rem", backgroundColor: "aliceblue", padding: "1rem" }}>
                    No decision circle notifications
                </Typography>
            ) : (
                decisionNotifications.map(notification => (
                    <Card key={notification.id} variant="outlined" style={{ margin: '4rem' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar style={{ backgroundColor: "#526D82" }}>
                                {getInitials(notification.decisionMakerName)} {/* Assuming decisionMakerName exists */}
                                </Avatar>
                                <Typography variant="body1" style={{ marginLeft: '10px' }}>
                                {notification.decisionMakerName}
                                </Typography>
                                <Typography variant="body2" style={{ marginLeft: '10px' }}>
                                    is requesting you to join their decision circle
                                </Typography>
                            </Box>
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

export default withAuth(Notification);
