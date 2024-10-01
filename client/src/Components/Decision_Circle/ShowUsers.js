import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GetGroup.css';
import { removeUsersFromGroup ,getdecisionSharedDecisionCircle} from './Networkk_Call';
import { useNavigate, useParams,useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { IoPersonAdd } from "react-icons/io5";
import { IoMdRemoveCircle } from "react-icons/io";
import { Card, CardContent, Typography, Button, Grid } from '@mui/material';



const ShowUsers = () => {
    const [groups, setGroups] = useState(null);
    const [decisions,setDecisions] = useState([]);
    const [members, setMembers] = useState([]);
    const { groupId } = useParams();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const groupName = params.get('group_name');

    const navigate = useNavigate();

    useEffect(() => {
        if (groupId) {
            fetchGroupDetails();
        }
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getUsersForGroup/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Response data:', response.data);
            if (response.data.error) {
                toast.error(response.data.error);
            } else {
                setGroups(response.data.group);
                setMembers(response.data.members);
            }
        } catch (err) {
            toast.error('An error occurred while fetching the details');
            console.error(err);
            fetchGroupDetails(); 
        }
    };

    const handleRemoveUser = async (userId,e) =>{
        e?.preventDefault();
        try{
            setMembers((prevMembers) => prevMembers.filter(member => member.user_id !== userId));
            const response = await removeUsersFromGroup(groupId,userId);
            setGroups(response.group);
            setMembers(response.members);
            fetchGroupDetails(); 
            toast.success('User removed successfully');
        } catch (error) {
            toast.error('Error removing user from group');
            console.log('Fetching error:',error);
            fetchGroupDetails();
        }
    }

    const handleAddPersonClick = () => {
        console.log('Group data:', groups); 
    
        if (groups.length > 0 && groups[0].group_name && groups[0].id) {
            navigate(`/decisiongroup/${groups[0].group_name}?id=${groups[0].id}`);
        } else {
            toast.error('Group details are not available.');
        }
    };
    
    useEffect(()=>{
        const fetchDecisions = async () =>{
        try {
            const data = await getdecisionSharedDecisionCircle();
            setDecisions(data );
            console.log(data,'sbsysb')
        } catch (error) {
          toast.error('Failed to fetch decisions');
          console.log('Fetching error:',error)  
        }           
    };
    fetchDecisions();
    },[])

    
    return (
        <div className="getGroupp">
            {groups && (
                <div className="group-details">
                    <h4>{groupName || groups.group_name}</h4>
                    <IoPersonAdd className='icon' onClick={handleAddPersonClick} />
                    {members.length > 0 ? (
                        <ul className="group-members">
                            {members.map(member => (
                                <li key={member.user_id}>
                                    {member.displayname} ({member.email})
                                    <IoMdRemoveCircle onClick={()=> handleRemoveUser (member.user_id)} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No members found in this group.</p>
                    )}
                </div>
            )}

            <div>
                <h4>Shared Decisions</h4>
                <Grid container spacing={3}>
                    {Array.isArray(decisions) && decisions.length > 0 ? (
                        decisions.map(decision => (
                            <Grid item xs={12} sm={6} md={6} key={decision.decision_id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            {decision.decision_name}
                                        </Typography>
                                        <Typography variant="body2" color="">
                                            <b>Decision Details:</b> {decision.user_statement}
                                        </Typography>
                                        <Typography variant="body2" color="">
                                            <b>Due Date:</b> {decision.decision_due_date ? new Date(decision.decision_due_date).toISOString().split('T')[0] : ''}
                                        </Typography>
                                        <Typography variant="body2" color="">
                                            <b>Taken Date:</b> {decision.decision_taken_date ? new Date(decision.decision_due_date).toISOString().split('T')[0] : ''}
                                        </Typography>
                                        <Typography variant="body2" color="">
                                            <b>Decision Reasons:</b> {decision.decision_reason.join(',')}
                                        </Typography>
                                        {/* <Button variant="contained" size="small" onClick={() => navigate(`/decisiondetails/${decision.id}`)}>
                                            View Details
                                        </Button> */}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography sx={{mt:2,ml:3}} variant="body2" color="text.secondary" >
                            No decisions available.
                        </Typography>
                    )}
                </Grid>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ShowUsers;
