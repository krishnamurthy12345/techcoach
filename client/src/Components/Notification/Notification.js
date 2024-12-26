import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardContent, Avatar, Tooltip, Box } from '@mui/material';
import { acceptOrRejectInnerCircle, getInnerCircleAcceptNotification } from '../../Components/Group/Network_Call';
import { ToastContainer, toast } from 'react-toastify';
import withAuth from '../withAuth';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [response, setResponse] = useState(null); 

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

    return (
        <div>
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



// import React, { useEffect, useState } from 'react';
// import { Button, Typography, Card, CardContent, Avatar, Tooltip, Box, Switch, TextField, FormControlLabel, Checkbox } from '@mui/material';
// import { acceptOrRejectInnerCircle, getInnerCircleAcceptNotification } from '../../Components/Group/Network_Call';
// import { ToastContainer, toast } from 'react-toastify';
// import withAuth from '../withAuth';

// const Notification = () => {
//     const [notifications, setNotifications] = useState([]);
//     const [response, setResponse] = useState(null);
//     const [receiveReminders, setReceiveReminders] = useState(false);
//     const [phoneNumber, setPhoneNumber] = useState('');
//     const [countryCode, setCountryCode] = useState('');
//     const [isWhatsApp, setIsWhatsApp] = useState(false);

//     const getNotification = async () => {
//         try {
//             const innerCircleResponse = await getInnerCircleAcceptNotification();
//             setNotifications(innerCircleResponse.notAcceptedMembers.filter(notification => innerCircleResponse.groupDetails[notification.group_id].userDetails));
//             setResponse(innerCircleResponse);
//         } catch (error) {
//             console.error('Error in fetching the notifications:', error);
//             toast('An error occurred while fetching the notifications');
//         }
//     };

//     const handleAction = async (groupId, status) => {
//         try {
//             await acceptOrRejectInnerCircle(groupId, status);
//             toast('Status Updated Successfully');
//             getNotification();
//         } catch (error) {
//             console.error(`Error ${status ? 'accepting' : 'rejecting'} notification:`, error);
//             toast(`An error occurred while ${status ? 'accepting' : 'rejecting'} the notification`);
//         }
//     };

//     const handleToggleReminders = () => {
//         setReceiveReminders(!receiveReminders);
//     };

//     useEffect(() => {
//         getNotification();
//     }, []);

//     const getInitials = (name) => {
//         return name ? name.charAt(0).toUpperCase() : '';
//     };

//     const handleSavePhoneDetails = () => {
//         if (!countryCode || !phoneNumber) {
//             toast('Please enter a valid country code and phone number');
//             return;
//         }
//         const data = {
//             phoneNumber: `${countryCode}${phoneNumber}`,
//             isWhatsApp,
//         };
//         console.log('Phone details saved:', data);
//         toast('Phone details saved successfully');
//     };

//     return (
//         <div>
//             <h3>Inner Circle Notifications</h3>
//             <Box mb={3}>
//                 <FormControlLabel
//                     control={<Switch checked={receiveReminders} onChange={handleToggleReminders} />}
//                     label="Receive Reminders on Phone"
//                 />
//             </Box>

//             {receiveReminders && (
//                 <Box mb={3} display="flex" alignItems="center" gap={2}>
//                     <TextField
//                         label="Country Code"
//                         value={countryCode}
//                         onChange={(e) => setCountryCode(e.target.value)}
//                         variant="outlined"
//                         style={{ width: '100px' }}
//                     />
//                     <TextField
//                         label="Phone Number"
//                         value={phoneNumber}
//                         onChange={(e) => setPhoneNumber(e.target.value)}
//                         variant="outlined"
//                     />
//                     <FormControlLabel
//                         control={
//                             <Checkbox
//                                 checked={isWhatsApp}
//                                 onChange={(e) => setIsWhatsApp(e.target.checked)}
//                             />
//                         }
//                         label="This number is registered on WhatsApp"
//                     />
//                     <Button variant="contained" color="primary" onClick={handleSavePhoneDetails}>
//                         Save
//                     </Button>
//                 </Box>
//             )}

//             {notifications.length === 0 ? (
//                 <Typography variant="h5" style={{ textAlign: 'center', marginTop: '1rem', backgroundColor: 'aliceblue', padding: '1rem' }}>
//                     No Inner Circle notifications
//                 </Typography>
//             ) : (
//                 notifications.map(notification => (
//                     <Card key={notification.id} variant="outlined" style={{ margin: '4rem' }}>
//                         <CardContent>
//                             {response && response.groupDetails[notification.group_id] && (
//                                 <Box display="flex" alignItems="center" mb={2}>
//                                     <Avatar style={{ backgroundColor: '#526D82' }}>
//                                         {getInitials(response.groupDetails[notification.group_id].userDetails.displayname)}
//                                     </Avatar>
//                                     <Typography variant="body1" style={{ marginLeft: '10px' }}>
//                                         {response.groupDetails[notification.group_id].userDetails.displayname}
//                                     </Typography>
//                                     <Typography variant="body2" style={{ marginLeft: '10px' }}>
//                                         is requesting you to join their inner circle
//                                     </Typography>
//                                 </Box>
//                             )}
//                             {response && response.acceptedDetails[notification.group_id] && (
//                                 <Box display="flex" alignItems="center" mb={2}>
//                                     <Typography variant="body2" style={{ marginRight: '10px' }}>
//                                         Members of that inner circle:
//                                     </Typography>
//                                     <Box display="flex" alignItems="center">
//                                         <Tooltip
//                                             title={response.acceptedDetails[notification.group_id].userDetails.displayname}
//                                             key={response.acceptedDetails[notification.group_id].userDetails.user_id}
//                                         >
//                                             <Avatar
//                                                 alt={response.acceptedDetails[notification.group_id].userDetails.displayname}
//                                                 src="/static/images/avatar/1.jpg"
//                                                 style={{ margin: '0 5px', backgroundColor: '#526D82' }}
//                                             />
//                                         </Tooltip>
//                                     </Box>
//                                 </Box>
//                             )}
//                             <Box display="flex" justifyContent="flex-end" gap={3}>
//                                 <Button variant="contained" color="primary" onClick={() => handleAction(notification.group_id, 'Accepted')}>
//                                     Accept
//                                 </Button>
//                                 <Button variant="contained" color="error" onClick={() => handleAction(notification.group_id, 'Not Accepted')}>
//                                     Reject
//                                 </Button>
//                             </Box>
//                         </CardContent>
//                     </Card>
//                 ))
//             )}
//             <ToastContainer />
//         </div>
//     );
// };

// export default withAuth(Notification);
