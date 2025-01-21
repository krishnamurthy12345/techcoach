// import React, { useState, useEffect } from 'react';
// import { Avatar, Checkbox, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Paper, Typography, Box, Grid, Button } from '@mui/material';
// import { useNavigate, useParams } from 'react-router-dom';
// import withAuth from '../withAuth';
// import { getUserListForDecisionCircle, decisionCircleCreation, getDecisionCircleAlreadyUsers, sendDecisionCircleInvitation } from './Networkk_Call';
// import axios from 'axios';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const DecisionGroup = () => {
//   const [users, setUsers] = useState([]);
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
  
//   const { id } = useParams(); 
//   const navigate = useNavigate();
//   // console.log('nuooo',id);

//   useEffect(() => {
//     const fetchNames = async () => {
//       try {
//         const users = await getUserListForDecisionCircle();
//         setUsers(users);
//       } catch (error) {
//         console.error('Error fetching user list:', error);
//       }
//     };
//     fetchNames();
//   }, []);

//   const handleCheckboxChange = (event, user) => {
//     if (event.target.checked) {
//       setSelectedUsers((prev) => [...prev, user]);
//     } else {
//       setSelectedUsers((prev) =>
//         prev.filter((selectedUser) => selectedUser.user_id !== user.user_id)
//       );
//     }
//   };

//   const handleSubmit = async () => {
//     if (!id) {
//       toast.error('Group ID is not specified.');
//       return;
//     }

//     if (selectedUsers.length === 0) {
//       toast.error('No users selected.');
//       return;
//     }

//     const members = selectedUsers.map(user => (user.user_id ));

//     try {
//       const token = localStorage.getItem('token');
//       const userId = localStorage.getItem('user_id');
//       // console.log('awww',userId);

      
//     if (!userId) {
//       toast.error('User ID is not available.');
//       return;
//     }
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL}/group/decisionCircleCreation`,
//         {
//           created_by: userId,
//         type_of_group: 'decision_circle',
//         group_name: id,  
//         members:members
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       toast.success('Decision circle created successfully!');
//       console.log('Response:', response);

//       // Send individual invitations
//       for (const user of selectedUsers) {
//         try {
//           await sendDecisionCircleInvitation(user.email);
//           toast.success(`Invitation sent to ${user.email} successfully`);
//         } catch (invitationError) {
//           toast.error(`Failed to invite ${user.email}`);
//           console.error(`Error sending invitation to ${user.email}:`, invitationError);
//         }
//       }

//       navigate('/getdecisioncircle');
//     } catch (error) {
//       toast.error('Error creating decision circle');
//       console.error('Error creating decision circle:', error.response ? error.response.data : error.message);
//     }
//   };

//   const handleSearchInputChange = (e) => {
//     setSearchQuery(e.target.value.toLowerCase());
//   };

//   return (
//     <div>
//       <center>
//         <div style={{ maxWidth: '500px' }}>
//           <input type="text" id="group_id" value={id || ''} readOnly />
//         </div>
//       </center>
//       <Box sx={{ margin: '1rem', display: 'flex', justifyContent: 'center' }}>
//         <Grid container spacing={2} sx={{ maxWidth: '1000px' }}>
//           <Grid item xs={12} md={6}>
//             <Typography variant="h6">List of Members</Typography>
//             <input
//               placeholder="Search by email"
//               fullWidth
//               value={searchQuery}
//               onChange={handleSearchInputChange}
//               style={{
//                 width: "100%",
//                 borderRadius: "0.5rem",
//                 padding: "1rem"
//               }}
//             />
//             <List>
//               {users
//                 .filter(user => user.email===searchQuery)
//                 .map((user) => (
//                   <ListItem key={user.user_id} button>
//                     <ListItemAvatar>
//                       <Avatar sx={{ backgroundColor: "#526D82", border: "0.2rem solid white" }}>
//                         {user.displayname.charAt(0)}
//                       </Avatar>
//                     </ListItemAvatar>
//                     <ListItemText primary={user.displayname} secondary={user.email} />
//                     <ListItemSecondaryAction>
//                       <Checkbox
//                         edge="end"
//                         onChange={(event) => handleCheckboxChange(event, user)}
//                         checked={selectedUsers.some(selectedUser => selectedUser.user_id === user.user_id)}
//                       />
//                     </ListItemSecondaryAction>
//                   </ListItem>
//               ))}
//             </List>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             <Typography variant="h6">Selected Members:</Typography>
//             <Paper elevation={3} sx={{ padding: 2, mt: 2 }}>
//               {selectedUsers.length > 0 ? (
//                 <>
//                   <Box
//                     display="flex"
//                     justifyContent="center"
//                     alignItems="center"
//                     flexWrap="wrap"
//                     sx={{ marginTop: '2rem' }}
//                   >
//                     {selectedUsers.slice(0, 5).map((user, index) => (
//                       <Avatar
//                         key={index}
//                         sx={{
//                           backgroundColor: '#526D82',
//                           width: 40,
//                           height: 40,
//                           marginLeft: index === 0 ? 0 : '-10px',
//                           zIndex: selectedUsers.length - index,
//                           border: '0.2rem solid white',
//                         }}
//                       >
//                         {user.displayname.charAt(0)}
//                       </Avatar>
//                     ))}
//                     {selectedUsers.length > 5 && (
//                       <Typography sx={{ marginLeft: '10px' }}>
//                         +{selectedUsers.length - 5}
//                       </Typography>
//                     )}
//                   </Box>
//                   <Box mt={2}>
//                     {selectedUsers.map((user, index) => (
//                       <Typography key={index}>{user.displayname}</Typography>
//                     ))}
//                   </Box>
//                   <Box mt={2} display="flex" justifyContent="flex-end">
//                     <Button
//                       variant="contained"
//                       sx={{
//                         backgroundColor: '#526D82',
//                         borderRadius: '0.5rem',
//                         color: 'white',
//                       }}
//                       onClick={handleSubmit}
//                     >
//                       Submit
//                     </Button>
//                   </Box>
//                 </>
//               ) : (
//                 <Typography>No members selected</Typography>
//               )}
//             </Paper>
//           </Grid>
//         </Grid>
//       </Box>
//       <ToastContainer />
//     </div>
//   );
// };

// export default withAuth(DecisionGroup);





import React, { useState, useEffect } from 'react';
import { Avatar, Checkbox, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Paper, Typography, Box, Grid, Button } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import withAuth from '../withAuth';
import { getUserListForDecisionCircle, decisionCircleCreation, getDecisionCircleAlreadyUsers, sendDecisionCircleInvitation } from './Networkk_Call';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DecisionGroup = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { id } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const groupName = queryParams.get('group_name');

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const users = await getUserListForDecisionCircle();
        setUsers(users);
      } catch (error) {
        console.error('Error fetching user list:', error);
      }
    };
    fetchNames();
  }, []);

  const handleCheckboxChange = (event, user) => {
    if (event.target.checked) {
      setSelectedUsers((prev) => [...prev, user]);
    } else {
      setSelectedUsers((prev) =>
        prev.filter((selectedUser) => selectedUser.user_id !== user.user_id)
      );
    }
  };

  const handleSubmit = async () => {
    if (!id) {
      toast.error('Group ID is not specified.');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('No users selected.');
      return;
    }

    try {
      for (const user of selectedUsers) {
        const checkResponse = await getDecisionCircleAlreadyUsers(id, user.user_id);

        if (checkResponse?.alreadyExists) {
          toast.error(`User ${user.displayname} is already a member of this group.`);
          return; 
        }
      }

      // Create the decision circle after confirming no user is already a member
      await decisionCircleCreation(id, selectedUsers);
      toast.success('Decision circle created successfully!');

      // Now, send individual invitations
      for (const user of selectedUsers) {
        try {
          await sendDecisionCircleInvitation(user.email);
          toast.success(`Invitation sent to ${user.email} successfully`);
        } catch (invitationError) {
          toast.error(`Failed to invite ${user.email}`);
          console.error(`Error sending invitation to ${user.email}:`, invitationError);
        }
      }

      navigate('/getdecisioncircle');
    } catch (error) {
      toast.error('User is already a member of this group.');
      console.error('Error creating decision circle:', error.response ? error.response.data : error.message);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  return (
    <div>
      <center>
      <div style={{ maxWidth: '500px' }}>
          {/* <input type="text" id="group_id" value={id || ''} readOnly /> */}
          <input type="text" id="group_name" value={groupName || ''} readOnly />
        </div>
      </center>
      <Box sx={{ margin: '1rem', display: 'flex', justifyContent: 'center' }}>
        <Grid container spacing={2} sx={{ maxWidth: '1000px' }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">List of Members</Typography>
            <input
              placeholder="Search by email"
              fullWidth
              value={searchQuery}
              onChange={handleSearchInputChange}
              style={{
                width: "100%",
                borderRadius: "0.5rem",
                padding: "1rem"
              }}
            />
            <List>
              {users
                .filter(user => user.email===searchQuery)
                .map((user) => (
                  <ListItem key={user.user_id} button>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: "#526D82", border: "0.2rem solid white" }}>
                        {user.displayname.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={user.displayname} secondary={user.email} />
                    <ListItemSecondaryAction>
                      <Checkbox
                        edge="end"
                        onChange={(event) => handleCheckboxChange(event, user)}
                        checked={selectedUsers.some(selectedUser => selectedUser.user_id === user.user_id)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Selected Members:</Typography>
            <Paper elevation={3} sx={{ padding: 2, mt: 2 }}>
              {selectedUsers.length > 0 ? (
                <>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flexWrap="wrap"
                    sx={{ marginTop: '2rem' }}
                  >
                    {selectedUsers.slice(0, 5).map((user, index) => (
                      <Avatar
                        key={index}
                        sx={{
                          backgroundColor: '#526D82',
                          width: 40,
                          height: 40,
                          marginLeft: index === 0 ? 0 : '-10px',
                          zIndex: selectedUsers.length - index,
                          border: '0.2rem solid white',
                        }}
                      >
                        {user.displayname.charAt(0)}
                      </Avatar>
                    ))}
                    {selectedUsers.length > 5 && (
                      <Typography sx={{ marginLeft: '10px' }}>
                        +{selectedUsers.length - 5}
                      </Typography>
                    )}
                  </Box>
                  <Box mt={2}>
                    {selectedUsers.map((user, index) => (
                      <Typography key={index}>{user.displayname}</Typography>
                    ))}
                  </Box>
                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#526D82',
                        borderRadius: '0.5rem',
                        color: 'white',
                      }}
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography>No members selected</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <ToastContainer />
    </div>
  );
};

export default withAuth(DecisionGroup);
