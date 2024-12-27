import axios from 'axios';

const postNumber = async (mobileNumber, isWhatsapp) => {
    const token = localStorage.getItem('token');

    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/mobile`,
            { 
                mobile_number: mobileNumber, 
                is_whatsapp: isWhatsapp 
            }, 
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error saving mobile number:', error);
        throw error;
    }
};


export{
    postNumber
}