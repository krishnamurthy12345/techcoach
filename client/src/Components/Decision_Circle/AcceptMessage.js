// import React, { useEffect, useState } from 'react';
// import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography, Box, Button, CircularProgress } from '@mui/material';
// import CheckIcon from '@mui/icons-material/Check';
// import DoneIcon from '@mui/icons-material/Done'; 
// import { useNavigate } from 'react-router-dom';
// import { getSharedMemberss,shareDecisionInDecisionCircle,mailToDecisionCircleDecisionShare } from './Networkk_Call';
// import { ToastContainer, toast } from 'react-toastify';
// import withAuth from '../withAuth';

// const AcceptMessage = ({ decisionCircleDetails, decision, id }) => {
//     const [selectedMember, setSelectedMember] = useState(null);
//     const [sharedMembers, setSharedMembers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const navigate = useNavigate();

//     console.log("decision circle", decision);

//     const handleMemberClick = (memberId) => {
//         setSelectedMember(prevSelectedMember => prevSelectedMember === memberId ? null : memberId);
//     };

//     const handleSubmit = async () => {
//         const payload = {
//             decisionId: id,
//             groupId: decisionCircleDetails.group.id,
//             memberId: selectedMember
//         };

//         try {
//             const response = await shareDecisionInDecisionCircle(payload);
//             if (response.status === 200) {
//                 toast('Decision shared successfully!');
//                 setSelectedMember(null); 
//                 await getSharedMembersList(); 

//                 const selectedMemberDetails = decisionCircleDetails.members.find(member => member.user_id === selectedMember);
//                 const memberEmail = selectedMemberDetails?.email;

//                 if (selectedMemberDetails) {
//                     const memberName = selectedMemberDetails.displayname;

//                     console.log("aceptttttttttttt or not", decision);

//                     const decisionSummary = {
//                         decisionName: decision.decision_name,
//                         userStatement: decision.user_statement,
//                         reasons: decision.decision_reason.join(', '),
//                         dueDate: decision.decision_due_date,
//                         takenDate: decision.decision_taken_date
//                     };

//                     const responseToMail = await mailToDecisionCircleDecisionShare(memberEmail, decisionSummary);
//                     console.log("response from the mail", responseToMail);
//                 }

//             }  else {
//                 toast('Failed to share decision.');
//             }
//         } catch (error) {
//             console.error('Error sharing decision:', error);
//             toast('An error occurred while sharing the decision.');
//         }
//     };

//     console.log("selected memebr", selectedMember);

//     const getSharedMembersList = async () => {
//         const payload = {
//             groupId: decisionCircleDetails.group.id,
//             decisionId: id
//         };

//         try {
//             const response = await getSharedMemberss(payload);
//             console.log("response from shared member list", response);
//             setSharedMembers(response);
//         } catch (error) {
//             console.error('Error in fetching the shared members:', error);
//             toast('An error occurred while fetching the shared member decision');
//         } finally {
//             setLoading(false); 
//         }
//     };

//     useEffect(() => {
//         getSharedMembersList();
//     }, [decisionCircleDetails.group.id]); 

//     if (loading) {
//         return (
//             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//                 <CircularProgress />
//             </div>
//         );
//     }

//     if (!decisionCircleDetails || !decisionCircleDetails.group) {
//         return <Typography variant="h6" color="error">Group details are not available.</Typography>;
//     }

//     return (
//         <div>
//             <Typography variant="h5">Decision Circle Details</Typography>
//             <List>
//                 {decisionCircleDetails.members.map(member => {
//                     const sharedMember = sharedMembers.find(shared => shared.groupMember === member.user_id);
//                     const isClickable = member.status === "Accepted" && !sharedMember;

//                     return (
//                         <ListItem 
//                             key={member.user_id} 
//                             button={isClickable}
//                             onClick={() => isClickable && handleMemberClick(member.user_id)} 
//                             selected={selectedMember === member.user_id}
//                             style={{
//                                 cursor: isClickable ? "pointer" : "default",
//                                 backgroundColor: sharedMember ? "#d3d3d3" : "white" 
//                             }}
//                         >
//                             <ListItemAvatar>
//                                 <Avatar style={{ backgroundColor: "#526D82", color: "white" }}>
//                                     {member.displayname ? member.displayname.charAt(0) : '?'}
//                                 </Avatar>
//                             </ListItemAvatar>
//                             <ListItemText 
//                                 primary={member.displayname} 
//                                 secondary={member.email} 
//                             />
//                             {selectedMember === member.user_id && (
//                                 <CheckIcon color="primary" />
//                             )}
//                             {sharedMember && (
//                                 <DoneIcon color="action" /> 
//                             )}
//                             <Typography variant="caption" color={member.status === "Accepted" ? "primary" : "error"}>
//                                 {member.status === "Accepted" ? "Accepted" : "Not Accepted"}
//                             </Typography>
//                         </ListItem>
//                     );
//                 })}
//             </List>
            
//             {selectedMember && (
//                 <Box mt={2}>
//                     <Button variant="contained" color="primary" onClick={handleSubmit}>
//                         Share Decision
//                     </Button>
//                 </Box>
//             )}
//             <ToastContainer />
//         </div>
//     );
// };

// export default withAuth(AcceptMessage);



import React, { useState, useEffect } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { acceptOrRejectDecisionCircle, getDecisionCircleAcceptNotification } from '../Decision_Circle/Networkk_Call';

const AcceptMessage = () => {
    const [status, setStatus] = useState(null);
    const [senderName, setSenderName] = useState('');
    const groupId = 1; // Replace with actual group ID or obtain from props/context

    useEffect(() => {
        const getInvitationStatus = async () => {
            try {
                const response = await getDecisionCircleAcceptNotification();
                setStatus(response.status);
                setSenderName(response.senderName); // Assuming response contains senderName
            } catch (error) {
                console.error('Error fetching invitation status:', error);
            }
        };
        getInvitationStatus();
    }, []);

    const handleAccept = async () => {
        try {
            await acceptOrRejectDecisionCircle(groupId, 'accepted');
            setStatus('Accepted');
        } catch (error) {
            console.error('Error accepting invitation:', error);
        }
    };

    const handleReject = async () => {
        try {
            await acceptOrRejectDecisionCircle(groupId, 'rejected');
            setStatus('Rejected');
        } catch (error) {
            console.error('Error rejecting invitation:', error);
        }
    };

    return (
        <Box sx={{ padding: '1rem' }}>
            {status ? (
                <Typography variant="h6">
                    {`Invitation ${status} from ${senderName}`}
                </Typography>
            ) : (
                <>
                    <Typography variant="h6">
                        Do you accept the invitation from {senderName}?
                    </Typography>
                    <Button variant="contained" sx={{ mr: 2 }} onClick={handleAccept}>
                        Accept
                    </Button>
                    <Button variant="contained" color="error" onClick={handleReject}>
                        Reject
                    </Button>
                </>
            )}
        </Box>
    );
};

export default AcceptMessage;
