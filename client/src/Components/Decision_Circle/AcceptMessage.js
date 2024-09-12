import React, { useEffect, useState } from 'react';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography, Box, Button, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DoneIcon from '@mui/icons-material/Done'; 
import { useNavigate } from 'react-router-dom';
import { getSharedMemberss } from './Networkk_Call';
import { ToastContainer, toast } from 'react-toastify';
import withAuth from '../withAuth';

const AcceptMessage = ({ decisionCircleDetails, decision, id }) => {
    const [selectedMember, setSelectedMember] = useState(null);
    const [sharedMembers, setSharedMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    console.log("decision circle", decision);

    const handleMemberClick = (memberId) => {
        setSelectedMember(prevSelectedMember => prevSelectedMember === memberId ? null : memberId);
    };

    const handleSubmit = async () => {
        const payload = {
            groupId: decisionCircleDetails.group.id,
            memberId: selectedMember
        };

        // Submit logic
    };

    console.log("selected member", selectedMember);

    const getSharedMembersList = async () => {
        if (decisionCircleDetails && decisionCircleDetails.group) {
            const payload = {
                groupId: decisionCircleDetails.group.id,
            };

            try {
                const response = await getSharedMemberss(payload);
                console.log("response from shared member list", response);
                setSharedMembers(response);
            } catch (error) {
                console.error('Error in fetching the shared members:', error);
                toast('An error occurred while fetching the shared member decision');
            } finally {
                setLoading(false); 
            }
        } else {
            setLoading(false); // If no group exists, stop loading
        }
    };

    useEffect(() => {
        getSharedMembersList();
    }, [decisionCircleDetails]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    if (!decisionCircleDetails || !decisionCircleDetails.group) {
        return <Typography variant="h6" color="error">Group details are not available.</Typography>;
    }

    return (
        <div>
            <Typography variant="h5">Decision Circle Details</Typography>
            <List>
                {decisionCircleDetails.members.map(member => {
                    const sharedMember = sharedMembers.find(shared => shared.groupMember === member.user_id);
                    const isClickable = member.status === "Accepted" && !sharedMember;

                    return (
                        <ListItem 
                            key={member.user_id} 
                            button={isClickable}
                            onClick={() => isClickable && handleMemberClick(member.user_id)} 
                            selected={selectedMember === member.user_id}
                            style={{
                                cursor: isClickable ? "pointer" : "default",
                                backgroundColor: sharedMember ? "#d3d3d3" : "white" 
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar style={{ backgroundColor: "#526D82", color: "white" }}>
                                    {member.displayname ? member.displayname.charAt(0) : '?'}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={member.displayname} 
                                secondary={member.email} 
                            />
                            {selectedMember === member.user_id && (
                                <CheckIcon color="primary" />
                            )}
                            {sharedMember && (
                                <DoneIcon color="action" /> 
                            )}
                            <Typography variant="caption" color={member.status === "Accepted" ? "primary" : "error"}>
                                {member.status === "Accepted" ? "Accepted" : "Not Accepted"}
                            </Typography>
                        </ListItem>
                    );
                })}
            </List>
            
            {selectedMember && (
                <Box mt={2}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Share Decision
                    </Button>
                </Box>
            )}
            <ToastContainer />
        </div>
    );
};

export default withAuth(AcceptMessage);
