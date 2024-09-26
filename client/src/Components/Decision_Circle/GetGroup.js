import React, { useEffect, useState } from 'react';
import { getAlldecisionGroup, deleteDecisionGroup, getUserDecisionCircles } from './Networkk_Call';
import './GetGroup.css';
import { MdEdit, MdDeleteForever } from "react-icons/md";
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const GetGroup = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userCircles, setUserCircles] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const data = await getAlldecisionGroup();
            setGroups(data);
            // toast.success('Groups fetched successfully');
        } catch (error) {
            // toast.error('Failed to fetch groups');
            console.log('Fetching error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserCircles = async () => {
        setLoading(true);
        try {
            const data = await getUserDecisionCircles();
            setUserCircles(data.decisionCircles || []);
            console.log('assa', data.decisionCircles || []);
        } catch (error) {
            setError('Failed to fetch user decision circles.');
            console.error('Error fetching user decision circles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async (id) => {
        if (window.confirm('Are you sure that you want to delete this decision-circle group')) {
            try {
                await deleteDecisionGroup(id);
                fetchGroups();
                setGroups(prevGroups => prevGroups.filter(group => group.id !== id));
                toast.success('Group deleted successfully');
            } catch (error) {
                toast.error('Failed to delete group');
            }
        }
    };

    useEffect(() => {
        fetchGroups();
        loadUserCircles();
    }, []);


    return (
        <div className="getGroup">
            {loading ? (
                <p>Loading groups...</p>
            ) : groups.length === 0 ? (
                <div className='nogroup'>
                    <p>Please create a group</p>
                    <Link to='/decisioncircle'><button className='nogroup-button'>Click me</button></Link>
                </div>

            ) : (
                <div className="row sub-getGroup">
                    <h5 className='f-5'>Decision Circle Created by Me</h5>
                    {groups.map(group => (
                        <div key={group.id} className="col-sm-12 col-md-6 col-lg-4">
                            <div className="getGroupName">
                                <div className='editgroupname'>
                                    <h3>{group.group_name}</h3>
                                    <div className='mdedit'>
                                        <MdEdit className='mdedit-icon' onClick={() => navigate(`/decisioncircle/${group.id}`)} />
                                        <MdDeleteForever className='mdedit-icon1' onClick={() => handleDeleteGroup(group.id)} />
                                        {/* <button className='getgroup-delete' onClick={() => handleDeleteGroup(group.id)}>Delete</button> */}
                                    </div>
                                </div>

                                <Link to={`/getdecisioncircle/${group.id}?group_name=${group.group_name}`}><button className='show-button'>Show Persons</button></Link>
                                <div className='group-button'>
                                    <Link to={`/decisiongroup/${group.group_name}?id=${group.id}`}><button className='group-add'>Add Person</button></Link>
                                    <Link to={`/getdecisioncircle/${group.id}?group_name=${group.group_name}`}><button className='group-remove'>Remove Person</button></Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div>
                        <h5 className='f-5'> Decision Circle Created By Others</h5>
                        <div className='circles'>
                            {userCircles.map(circle => (
                                <div key={circle.id} className="circle-item">
                                    <div className="getcircles">
                                        <h5 className='f-5'>{circle.group_name}</h5>
                                        <Link to={`/getdecisioncircle/${circle.id}?group_name=${circle.group_name}`}>
                                            <button className='show-button'>Show Persons</button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default GetGroup;
