// EditProfile.js

import React, { useState } from 'react';
import axios from 'axios';

function Update({ profileId, profileData }) {
  const [formData, setFormData] = useState({
    image: profileData.image,
    password: profileData.password,
    email: profileData.email
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/profile/${profileId}`, formData);
      // Handle success (e.g., show a success message)
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div>
      <h4>Edit Profile</h4>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Image:</label>
          <input type="text" name="image" value={formData.image} onChange={handleInputChange} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleInputChange} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

export default Update;
