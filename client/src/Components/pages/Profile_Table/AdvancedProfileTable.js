import React, { useEffect, useState } from 'react';
import './AdvancedProfileTable.css';
import { IoIosAddCircleOutline, IoIosRemoveCircleOutline } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const AdvancedProfileTable = () => {
    const [formsData, setFormsData] = useState({
        goals: [''],
        values: [''],
        resolutions: [''],
        constraints: [''],
        other_factors: ['']
    });

    const navigate = useNavigate();
    const [isNewAdvancedProfile, setIsNewAdvancedProfile] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${process.env.REACT_APP_API_URL}/api/data/advanced`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then((response) => {
                    const { goals, values, resolutions, constraints, otherfactors } = response.data;
                    console.log('User Data:', response.data);
                    if (response.data) {
                        setFormsData({
                            goals: goals ? goals.map(item => item.value) : [''],
                            values: values ? values.map(item => item.value) : [''],
                            resolutions: resolutions ? resolutions.map(item => item.value) : [''],
                            constraints: constraints ? constraints.map(item => item.value) : [''],
                            other_factors: otherfactors ? otherfactors.map(item => item.value) : ['']
                        });
                        setIsNewAdvancedProfile(false);
                    } else {
                        throw new Error('data format is Incorrect');
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.status === 404) {
                            toast.info('No Existing Advanced Profile found.Please Create a new Advanced Profile');
                            setIsNewAdvancedProfile(true);
                        } else {
                            console.err('Error response:', err.response.data);
                            toast.err(`Error: ${err.response.statusText}`)
                        }
                    } else {
                        console.error('Error response:', err);
                        toast.error('An error Occured.Please try again')
                    }
                });
        } else {
            toast.err('No token found.Please Log In.')
        }
    }, []);

    const handleAdd = (type) => {
        setFormsData((prevData) => ({
            ...prevData,
            [type]: [...prevData[type], '']
        }));
    };

    const handleRemove = (type, index) => {
        setFormsData((prevData) => ({
            ...prevData,
            [type]: prevData[type].filter((_, i) => i !== index)
        }));
    };

    const handleChange = (type, index, value) => {
        setFormsData((prevData) => ({
            ...prevData,
            [type]: prevData[type].map((item, i) => (i === index ? value : item))
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        const { goals, values, resolutions, constraints, other_factors } = formsData;
        const data = { goals, values, resolutions, constraints, other_factors };

        try {
            if (isNewAdvancedProfile) {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/data/advanced`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                await axios.put(`${process.env.REACT_APP_API_URL}/api/data/advanced`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            setFormsData({
                goals: [''],
                values: [''],
                resolutions: [''],
                constraints: [''],
                other_factors: ['']
            });
            toast.success('Data Submitted successfully!');
            navigate('/advancedProfile')
        } catch (error) {
            console.error('Error Submitting data:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='AdvancedTable'>
            <div className='main-Advancedtable'>
            <h3>Advanced - Profile Details</h3>
                <div className='advanced-table'>
                    <form onSubmit={handleSubmit}>
                        {Object.keys(formsData).map((type) => (
                            <div key={type} className='form-section'>
                                <div className='section-header'>
                                    <h6>{type.charAt(0).toUpperCase() + type.slice(1)}:</h6>
                                </div>
                                <div className='form-section-body'>
                                    {Array.isArray(formsData[type]) && formsData[type].length > 0 ? (
                                        formsData[type].map((item, index) => (
                                            <div key={index} className='input-row'>
                                                <input
                                                    type='text'
                                                    value={item}
                                                    placeholder={`Enter Your ${type}...`}
                                                    onChange={(e) => handleChange(type, index, e.target.value)}
                                                />
                                                <div className='action-icons'>
                                                    <IoIosAddCircleOutline
                                                        className='icons'
                                                        onClick={() => handleAdd(type)}
                                                    />
                                                    {formsData[type].length > 1 && (
                                                        <IoIosRemoveCircleOutline
                                                            className='icons'
                                                            onClick={() => handleRemove(type, index)}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div> No data Available </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button
                            type='submit'
                            className='save-AdvancedProfilebutton'
                            disabled={loading}>
                            {isNewAdvancedProfile ? (loading ? 'Saving...' : 'Save') : (loading ? 'Updating...' : 'Update')}
                        </button>
                    </form>
                </div>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            </div>
        </div>
    );
};

export default AdvancedProfileTable;