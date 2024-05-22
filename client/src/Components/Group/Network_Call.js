import axios from "axios";

const getUserListForInnerCircle = async () => {
    //console.log("get user list");
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/fetchUserList`, {
            headers: {
              Authorization: `Bearer ${token}`
            }});
        //console.log("response from frontend", response);
        return response.data.tasks;
    } catch (error) {
        console.log(error);
        return error.message;
    }
};

const innerCircleCreation = async (groupData) => {
    const token = localStorage.getItem('token');
    try {
        //console.log("group data", groupData);
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/group/innerCircleCreation`,
            groupData,  
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        //console.log("response from inner circle creation", response);
        return response;
    } catch (error) {
        console.log(error);
        return error.message;
    }
}

const checkInnerCircleExists = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/checkInnerCircleExists`, {
            headers: {
              Authorization: `Bearer ${token}`
            }});
        //console.log("response from check inner circle", response);
        return response.data.exists;
    } catch (error) {
        console.log(error);
        return error.message;
    }
}

const getInnerCircleDetails = async() =>{
    const token = localStorage.getItem('token');
    try{
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getInnerCircleDetails`,{
            headers: {
                Authorization: `Bearer ${token}`
        }});

        //console.log("response from inner circle fetch", response.data );
        return response.data;
    }catch(error){
        console.log(error);
        return error.message;
    }
}

const removeMemberFromInner = async (userId, group_id) => {
    const token = localStorage.getItem('token');
    //console.log("user id for removal", userId, group_id);
    try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/group/removeMemberFromInner`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                userId,
                group_id
            }
        });
        //console.log("response from remove", response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        return error.message;
    }
};

const getAddMemberNameListFetch=  async(existingMemberIds) =>{
    const token = localStorage.getItem('token');
    console.log("member list", existingMemberIds);
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/getAddMemberNameList`, 
        { existingMemberIds }, 
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
        //console.log("response from remove", response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        return error.message;
    }
}

const addMemberToInnerCircle = async(userId, groupId) =>{
    const token = localStorage.getItem('token');
    //console.log("request bodddddddddy", userId, groupId);
    try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/group/addMemberInInnerCircle`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                userId,
                groupId
            }
        }
    );
        //console.log("response from remove", response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        return error.message;
    }
}

const shareDecisionInInnerCircle = async (payload) => {
    const token = localStorage.getItem('token');
    console.log("shshshhshshshhsjjkkkkk", payload)
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/shareDecisionInInnerCircle`, payload, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response;
};

const getSharedMembers = async (payload) => {
    const token = localStorage.getItem('token');
    console.log("shshshhshshshhsjjkkkkk", payload)
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/group/getSharedMembers`, payload, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.result;
};

const getAcceptNotification = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/getInnerCircleAcceptNotification`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const updateNotificationStatus = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/group/updateInnerCircleAcceptStatus`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.sharedDecisionsWithDetails;
};

export { 
    getUserListForInnerCircle, 
    innerCircleCreation, 
    checkInnerCircleExists, 
    getInnerCircleDetails, 
    removeMemberFromInner, 
    getAddMemberNameListFetch,
    addMemberToInnerCircle,
    shareDecisionInInnerCircle,
    getSharedMembers,
    getAcceptNotification,
    updateNotificationStatus
 };