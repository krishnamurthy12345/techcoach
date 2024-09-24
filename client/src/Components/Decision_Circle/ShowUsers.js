import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GetGroup.css';
import { removeUsersFromGroup } from './Networkk_Call';
import { useNavigate, useParams,useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { IoPersonAdd } from "react-icons/io5";
import { IoMdRemoveCircle } from "react-icons/io";


const ShowUsers = () => {
    const [groups, setGroups] = useState(null);
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
        }
    };

    const handleRemoveUser = async (userId) =>{
        try{
            const response = await removeUsersFromGroup(groupId,userId);
            setGroups(response.group);
            setMembers(response.members);
            toast.success('User removed successfully');
        } catch (error) {
            toast.error('Error removing user from group');
            console.log('Fetching error:',error)
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
    

    
    return (
        <div className="getGroupp">
            {groups ? (
                <div className="group-details">
                    <h4>{groupName || groups.group_name}</h4>
                    <IoPersonAdd className='icon' onClick={handleAddPersonClick}
                        disabled={!groups || !groups.group_name || !groups.id}   />
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
            ) : (
                <p>Loading group details...</p>
            )}
            <ToastContainer />
        </div>
    );
};

export default ShowUsers;
