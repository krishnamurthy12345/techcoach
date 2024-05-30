import React, { useState } from 'react';
import './ProfileTab.css';
import axios from 'axios';

const ProfileTab = () => {
  const [formData, setFormData] = useState({
    YearBorn: '',
    Gender: '',
    AddedDate: '',
    Communication: '',
    skill: [''],
    attitude: [''],
    strength: [''],
    weakness: [''],
    opportunity: [''],
    threat: ['']
  });

  const addField = (type) => {
    setFormData({
      ...formData,
      [type]: [...formData[type], '']
    });
  };

  const removeField = (type, index) => {
    const updatedFields = [...formData[type]];
    updatedFields.splice(index, 1);
    setFormData({
      ...formData,
      [type]: updatedFields
    });
  };

  const handleChange = (index, type, value) => {
    const updatedFields = [...formData[type]];
    updatedFields[index] = value;
    setFormData({
      ...formData,
      [type]: updatedFields
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...formData };

    try {
      if (formData.id) {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/user/data`, dataToSend);
        console.log('Profile updated successfully:', response.data);
      } else {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/user/data`, dataToSend);
        console.log('Profile created successfully:', response.data);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const renderAdditionalFields = (type) => {
    return formData[type].map((field, index) => (
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
      <form onSubmit={handleSubmit}>
        <center>
          <div>
            <label>Year Born:</label>
            <input type="date" name="YearBorn" value={formData.YearBorn} onChange={handleInputChange} placeholder="Year Born" />
          </div>
          <div>
            <label>Gender:</label>
            <div className="radio-group">
              <div>
                <label htmlFor="male">Male</label>
                <input type="radio" id="male" name="Gender" value="male" onChange={handleInputChange} />
              </div>
              <div>
                <label htmlFor="female">Female</label>
                <input type="radio" id="female" name="Gender" value="female" onChange={handleInputChange} />
              </div>
              <div>
                <label htmlFor="other">Other</label>
                <input type="radio" id="other" name="Gender" value="other" onChange={handleInputChange} />
              </div>
            </div>
          </div>
          <div>
            <label>Created Date:</label>
            <input type="date" name="AddedDate" value={formData.AddedDate} onChange={handleInputChange} placeholder="Added Date" />
          </div>
          <div>
            <label>Communication:</label>
            <input type="text" name="Communication" value={formData.Communication} onChange={handleInputChange} placeholder="Communication" />
          </div>
          <div className=''>
            <label>Skill:</label>
            {renderAdditionalFields('skill')}
            <button type="button" className='add-button' onClick={() => addField('skill')}>Add</button>
          </div>
          <div>
            <label>Attitude:</label>
            {renderAdditionalFields('attitude')}
            <button type="button" className='add-button' onClick={() => addField('attitude')}>Add</button>
          </div>
          <div className="">
            <label>Strength:</label>
            {renderAdditionalFields('strength')}
            <button type="button" className='add-button' onClick={() => addField('strength')}>Add</button>
          </div>
          <div className="">
            <label>Weakness:</label>
            {renderAdditionalFields('weakness')}
            <button type="button" className='add-button' onClick={() => addField('weakness')}>Add</button>
          </div>
          <div className="">
            <label>Opportunity:</label>
            {renderAdditionalFields('opportunity')}
            <button type="button" className='add-button' onClick={() => addField('opportunity')}>Add</button>
          </div>
          <div className="">
            <label>Threat:</label>
            {renderAdditionalFields('threat')}
            <button type="button" className='add-button' onClick={() => addField('threat')}>Add</button>
          </div>
          <br />
          <button type="submit" className='submit-button'>Submit</button>
        </center>
      </form>
    </div>
  );
};

export default ProfileTab;
