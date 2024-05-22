import React, { useState, useEffect } from 'react';
import { Avatar, Checkbox, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Paper, Typography, Box } from '@mui/material';
import { getUserListForInnerCircle, innerCircleCreation } from './Network_Call';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const InnerGroup = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const type_of_group = queryParams.get('type_of_group');
    console.log("type of group from inner circle", type_of_group);
    console.log("selected users", selectedUsers);

    useEffect(() => {
        const fetchNames = async () => {
            const users = await getUserListForInnerCircle();
            console.log("User List", users);
            setUsers(users);
        };
        fetchNames();
    }, []);

    const handleCheckboxChange = (event, user) => {
        if (event.target.checked) {
            setSelectedUsers([...selectedUsers, user]);
        } else {
            setSelectedUsers(selectedUsers.filter(selectedUser => selectedUser.user_id !== user.user_id));
        }
    };

    const handleSubmit = async () => {
        const groupData = {
            type_of_group: type_of_group,
            members: selectedUsers.map(user => ({
                user_id: user.user_id
            }))
        };

        console.log("Submitted Successfully", groupData);
        const response = await innerCircleCreation(groupData);
        console.log("response from innergroup", response);
        if(response.status === 200)(
            navigate('/innerCircleDisplay')
        )
    };

    return (
        <div style={{ margin: "1rem", display: "flex", justifyContent: "center", gap: "5rem" }}>
            <div style={{ width: "30rem" }}>
                <Typography variant="h6">List of Members</Typography>
                <List>
                    {users.map((user) => (
                        <ListItem key={user.user_id} button>
                            <ListItemAvatar>
                                <Avatar sx={{ backgroundColor: "#526D82", border: "0.2rem solid white" }}>{user.displayname.charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={user.displayname} />
                            <ListItemSecondaryAction>
                                <Checkbox
                                    edge="end"
                                    onChange={(event) => handleCheckboxChange(event, user)}
                                    name={user.displayname}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </div>
            <div style={{ width: "30rem" }}>
                <Typography variant="h6">Selected Names:</Typography>
                <Paper elevation={3} style={{ padding: "1rem", marginTop: "1rem" }}>
                    {selectedUsers.length > 0 ? (
                        <>
                            <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap" sx={{ marginTop: "2rem" }}>
                                {selectedUsers.slice(0, 5).map((user, index) => (
                                    <Avatar
                                        key={index}
                                        sx={{
                                            backgroundColor: "#526D82",
                                            width: 40,
                                            height: 40,
                                            position: "relative",
                                            left: `-${index * 10}px`,
                                            zIndex: selectedUsers.length - index,
                                            border: "0.2rem solid white"
                                        }}
                                    >
                                        {user.displayname.charAt(0)}
                                    </Avatar>
                                ))}
                                {selectedUsers.length > 5 && (
                                    <>
                                        +{selectedUsers.length - 5}
                                    </>
                                )}
                            </Box>
                            <Box mt={2}>
                                {selectedUsers.map((user, index) => (
                                    <Typography key={index}>{user.displayname}</Typography>
                                ))}
                            </Box>
                            <Box mt={2}>
                                <button 
                                    style={{
                                        backgroundColor: "#526D82", 
                                        borderRadius: "0.5rem", 
                                        width: "5rem", 
                                        height: "3rem", 
                                        border: "None", 
                                        color: "white", 
                                        marginLeft: "23rem"
                                    }} 
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                            </Box>
                        </>
                    ) : (
                        <Typography>No names selected</Typography>
                    )}
                </Paper>
            </div>
        </div>
    );
};

export default InnerGroup;