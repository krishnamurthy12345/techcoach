import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { ToastContainer, toast } from 'react-toastify';
import { postNumber } from './Network_call';
import { Button, Typography, Box, Checkbox } from '@mui/material';
import withAuth from '../withAuth';


function AddMobileNumber() {
    const [phone, setPhone] = useState('');
    const [isWhatsapp, setIsWhatsapp] = useState(false);

    const handleSave = async () => {
        try {
            if (!phone) {
                toast.error('Please enter a valid phone number');
                return;
            }

            const response = await postNumber(phone, isWhatsapp);
            toast.success(response.message || 'Mobile number saved successfully');
            setPhone('');
            setIsWhatsapp(false);
        } catch (error) {
            toast.error('Failed to save mobile number');
        }
    };

    return (
        <div>
            <div style={{ padding: '20px' }} className='notification-input'>
                <PhoneInput
                    country="us"
                    value={phone}
                    onChange={(value) => setPhone(value)}
                />
                <Box display="flex" alignItems="center" mt={2}>
                    <Checkbox
                        checked={isWhatsapp}
                        onChange={(e) => setIsWhatsapp(e.target.checked)}
                    />
                    <Typography variant="body2">This number is registered on WhatsApp also</Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '10px' }}
                    onClick={handleSave}
                >
                    Save
                </Button>
            </div>
            <ToastContainer />
        </div>
    )
}

export default withAuth(AddMobileNumber);