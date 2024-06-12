import React, { useEffect, useState } from 'react';
import './ProfileTab.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ProfileTab = () => {
  const [formData, setFormData] = useState({
    gender: '',
    attitude: [''],
    strength: [''],
    weakness: [''],
    opportunity: [''],
    threat: ['']
  });
  const [loading, setLoading] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if(formData) {
      const token = localStorage.getItem('token');
    axios.get(`${process.env.REACT_APP_API_URL}/api/user/data`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        const { gender, attitude, strength, weakness, opportunity, threat } = response.data;
        console.log('dededed',response.data);
        if (gender) {
          setFormData({
            gender,
            attitude: attitude ? attitude.map(item => item.value) : [],
            strength: strength ? strength.map(item => item.value) : [],
            weakness: weakness ? weakness.map(item => item.value) : [],
            opportunity: opportunity ? opportunity.map(item => item.value) : [],
            threat: threat ? threat.map(item => item.value) : []
          });
          setIsNewProfile(false);
        } else {
          throw new Error('Data format is incorrect');
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          toast.info('No existing profile found. Please create a new profile.');
          setIsNewProfile(true);
        } else {
          console.error(err);
          toast.error('An error occurred. Please try again.');
        }
      });
    }
  }, []);
  


  const addField = (type) => {
    setFormData((prevData) => ({
      ...prevData,
      [type]: [...prevData[type], '']
    }));
  };

  const removeField = (type, index) => {
    setFormData((prevData) => {
      const updatedFields = [...prevData[type]];
      updatedFields.splice(index, 1);
      return {
        ...prevData,
        [type]: updatedFields
      };
    });
  };

  const handleChange = (index, type, value) => {
    setFormData((prevData) => {
      const updatedFields = [...prevData[type]];
      updatedFields[index] = value;
      return {
        ...prevData,
        [type]: updatedFields
      };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { gender, attitude, strength, weakness, opportunity, threat } = formData;

    const data = { gender, attitude, strength, weakness, opportunity, threat };

    try {
      if (isNewProfile) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/user/data`, data);
        toast.success('Profile Created successfully');
      } else {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/user/data`, data);
        toast.success('Profile Updated successfully');
      }
      navigate('/profile');
      setFormData({
        gender: '',
        attitude: [''],
        strength: [''],
        weakness: [''],
        opportunity: [''],
        threat: ['']
      });
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderAdditionalFields = (type) => {
    if (!formData[type]) {
      return null;
    }
    return formData[type]
    .map((field, index) => (
      <div className="additional-field" key={index}>
        <input
          type="text"
          value={field} 
          onChange={(e) => handleChange(index, type, e.target.value)}
          placeholder={type.charAt(0).toUpperCase() + type.slice(1)}
        />
        <button type="button" className='remove-button' onClick={() => removeField(type, index)}>Remove</button>
      </div>
    ));
  };

  return (
    <div className='profile-container'>
      <h3 className='profile-title'>Profile Details</h3>
      <form onSubmit={handleSubmit} className='profile-header'>
        <center>
          {/* <div>
            <label>Gender:</label>
            <div className="radio-group">
              <div>
                <label htmlFor="male">Male</label>
                <input type="radio" id="male" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleInputChange} />
              </div>
              <div>
                <label htmlFor="female">Female</label>
                <input type="radio" id="female" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleInputChange} />
              </div>
              <div>
                <label htmlFor="other">Other</label>
                <input type="radio" id="other" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleInputChange} />
              </div>
            </div>
          </div> */}
          <div>
            <label>Attitude:</label>
            {renderAdditionalFields('attitude')}
            <button type="button" className='add-button' onClick={() => addField('attitude')}>Add</button>
          </div>
          <div>
            <label>Strength:</label>
            {renderAdditionalFields('strength')}
            <button type="button" className='add-button' onClick={() => addField('strength')}>Add</button>
          </div>
          <div>
            <label>Weakness:</label>
            {renderAdditionalFields('weakness')}
            <button type="button" className='add-button' onClick={() => addField('weakness')}>Add</button>
          </div>
          <div>
            <label>Opportunity:</label>
            {renderAdditionalFields('opportunity')}
            <button type="button" className='add-button' onClick={() => addField('opportunity')}>Add</button>
          </div>
          <div>
            <label>Threat:</label>
            {renderAdditionalFields('threat')}
            <button type="button" className='add-button' onClick={() => addField('threat')}>Add</button>
          </div>
          <br />
          <input type='submit' value={isNewProfile ? "Save" : "Update"} disabled={loading} />
        </center>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default ProfileTab;
