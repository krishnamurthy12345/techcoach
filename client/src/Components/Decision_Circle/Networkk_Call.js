import axios from "axios";

const getUserListForDecisionCircle = async () => {
    //console.log("get user list");
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/fetchUserList`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        //console.log("response from frontend", response);
        return response.data.tasks;
    } catch (error) {
        console.log(error);
        return error.message;
    }
};

const decisionCircleCreation = async (group_id, members) => {
    const token = localStorage.getItem('token'); 
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/group/decisionCircleCreation`, 
            { group_id, members },
            {
                headers: {
                    Authorization: `Bearer ${token}`, 
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating Decision Group with Members:', error.response?.data || error.message);

        return error.message;
    }
};

const getUserDecisionCircles = async () => {
    const token = localStorage.getItem('token'); 
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/group/getUserDecisionCircles`,
            {
                headers: {
                    Authorization: `Bearer ${token}`, 
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating Decision Group with Members:', error.response?.data || error.message);
        return error.message;
    }
};

const getUsersForGroup = async (groupId) =>{
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getUsersForGroup/${groupId}`,
            {
                headers : {
                    Authorization : `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error ('Error fetching users for group:',error);
        throw error
    }
}

const removeUsersFromGroup = async (groupId,userId) =>{
    const token = localStorage.getItem('token');
    try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/group/removeUsersFromGroup/${groupId}/${userId}`,
            {
                headers : { 
                    Authorization : `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error ('Error fetching users for Group:',error);
        throw error
    }
}

const sendDecisionCircleInvitation = async (email) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/decisionCircleInvitation`,
            { email },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        console.log("response for Decision Circle Invitation", response);
        return response.data;
    } catch (error) {
        console.error("Error Inviting the person to the Decision App", error);
        throw error;
    }
};

// const decisionshareDecisionCircle = async(group_id,decision_id) =>{
//     const token = localStorage.getItem('token');
//  try{
//     const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/decisionshareDecisionCircle`,
//         {group_id,decision_id},
//        {
//         headers : {
//             Authorization : `Bearer ${token}`,
//          }
//        }
//     );
//    return response.data;
//   } catch (error) {
//     console.error('Error Fetching Decision Share:',error);
//     throw error
//   }
// }

const getdecisionSharedDecisionCircle = async () =>{
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getdecisionSharedDecisionCircle`,
            {
                headers : {
                    Authorization : `Bearer ${token}`
                }
            }
        )
        return response.data.results;
    } catch (error) {
        console.error('Error Fetching Decision Get Circles:',error);
        throw error
    }
}

const decisionCircleAddInvitation = async (email) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/decisionCircleAddInvitation`,
            { email },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        console.log("response for Decision Circle Invitation", response);
        return response.data;
    } catch (error) {
        console.error("Error Inviting the person to the Decision App", error);
        throw error;
    }
}

// group Name Networkk_calls  //
const postdecisionGroup = async (group_name, type_of_group = 'decision_circle') => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/group/decisionGroup`,
            {
                group_name,
                type_of_group
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating decision group:', error);
        throw error;
    }
};

const getAlldecisionGroup = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/group/decisiongroup`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching decision groups:', error);
        throw error;
    }
};

const getDecisionGroup = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/group/decisiongroup/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching decision group with ID ${id}:`, error);
        throw error;
    }
};

const putDecisionGroup = async (id,group_name,type_of_group = 'decision_circle') => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put(
            `${process.env.REACT_APP_API_URL}/group/decisiongroup/${id}`,
            {
                group_name,
                type_of_group
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating decision group with ID ${id}:`, error);
        throw error;
    }
};

const deleteDecisionGroup = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.delete(
            `${process.env.REACT_APP_API_URL}/group/decisiongroup/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error deleting decision group with ID ${id}:`, error);
        throw error;
    }
};

export {
    getUserListForDecisionCircle,
    decisionCircleCreation,
    getUserDecisionCircles,
    getUsersForGroup,
    removeUsersFromGroup,
    sendDecisionCircleInvitation,
    // decisionshareDecisionCircle,
    getdecisionSharedDecisionCircle,
    decisionCircleAddInvitation,
    // group namess
    postdecisionGroup,
    getAlldecisionGroup,
    getDecisionGroup,
    putDecisionGroup,
    deleteDecisionGroup
};