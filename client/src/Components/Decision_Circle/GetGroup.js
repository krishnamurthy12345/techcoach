import React, { useEffect, useState } from 'react';
import { getAlldecisionGroup, deleteDecisionGroup, } from './Networkk_Call';
import './GetGroup.css';
import { MdEdit } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const GetGroup = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const data = await getAlldecisionGroup();
            setGroups(data);
            // toast.success('Groups fetched successfully');
        } catch (error) {
            setError('Failed to fetch groups');
            toast.error('Failed to fetch groups');
            // console.error('Fetching error:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteGroup = async (id) => {
        try {
            await deleteDecisionGroup(id);
            fetchGroups();
            toast.success('Group deleted successfully');
        } catch (error) {
            setError('Failed to delete group');
            toast.error('Failed to delete group');
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <div className="container getGroup">
            {loading ? (
                <p>Loading groups...</p>
            ) : error ? (
                <p>{error}</p>
            ) : groups.length === 0 ? (
                <p>Please create a group</p>
            ) : (
                <div className="row sub-getGroup">
                    {groups.map(group => (
                        <div key={group.id} className="col-sm-12 col-md-6 col-lg-4">
                            <div className="getGroupName">
                                <div className='editgroupname'>
                                    <h3>{group.group_name}</h3>
                                    <div className='mdedit'>
                                        <MdEdit onClick={()=> navigate(`/decisioncircle/${group.id}`)}/>
                                    </div>
                                </div>
                                <button className='getgroup-delete' onClick={() => handleDeleteGroup(group.id)}>Delete</button>
                                <div className='group-button'>
                                    <button className='group-add'>Add Person</button>
                                    <button className='group-remove'>Remove Person</button>
                            </div>
                            </div>
                     </div>
                    ))}
                </div>
            )}
          <ToastContainer />
        </div>
    );
};

export default GetGroup;
