import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardContent, Avatar, Tooltip, Box, Checkbox, Switch } from '@mui/material';
import { acceptOrRejectInnerCircle, getInnerCircleAcceptNotification } from '../../Components/Group/Network_Call';
import { ToastContainer, toast } from 'react-toastify';
import { postNumber } from './Network_call';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './Notification.css';
import withAuth from '../withAuth';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [response, setResponse] = useState(null);
    const [iconClick, setIconClick] = useState(false)
    const [phone, setPhone] = useState('');
    const [isWhatsapp, setIsWhatsapp] = useState(false);

    const getNotification = async () => {
        try {
            const innerCircleResponse = await getInnerCircleAcceptNotification();
            console.log("Inner Circle Notifications:", innerCircleResponse);
            setNotifications(innerCircleResponse.notAcceptedMembers.filter(notification => innerCircleResponse.groupDetails[notification.group_id].userDetails));
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

    const handleClick = async () => {
        setIconClick((prev) => !prev);
    }

    const handleSave = async () => {
        try {
            if (!phone) {
                toast.error('Please enter a valid phone number');
                return;
            }
    
            const response = await postNumber(phone,isWhatsapp);
            toast.success(response.message || 'Mobile number saved successfully');
            setPhone(''); 
            setIsWhatsapp(false);
        } catch (error) {
            toast.error('Failed to save mobile number');
        }
    };
    
    return (
        <div>
            <div className='notification-toggle-icon'>
                <Switch className='notification-icon' onClick={handleClick} />
            </div>
            {iconClick && (
                <div style={{ padding: '20px' }} className='notification-input'>
                    <PhoneInput
                        country="us"
                        value={phone}
                        onChange={(value) => setPhone(value)}
                    />
                    <Box display="flex" alignItems="center" mt={2}>
                    <Checkbox
                            checked={isWhatsapp}
                            onChange={(e) => setIsWhatsapp(e.target.checked)} // Update WhatsApp status
                        />
                    <Typography variant="body2">This number is registered on WhatsApp also</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ marginTop: '10px' }}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </div>
            )}
            <h3>Inner Circle Notifications</h3>
            {/* Inner Circle Notifications */}
            {notifications.length === 0 ? (
                <Typography variant="h5" style={{ textAlign: "center", marginTop: "1rem", backgroundColor: "aliceblue", padding: "1rem" }}>
                    No Inner Circle notifications
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
            <ToastContainer />
        </div>
    );
};

export default withAuth(Notification);
