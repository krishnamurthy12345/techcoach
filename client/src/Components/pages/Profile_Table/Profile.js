import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserEdit } from "react-icons/fa";
import './Profile.css';

const Profile = () => {
  const [formData, setFormData] = useState({});
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const user = resp.data.tasks && resp.data.tasks.length ? resp.data.tasks[0] : {};
        setUserData(user);

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/data`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFormData(response.data);
        console.log('Fetched profile data:', response.data);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    loadData();
  }, []);

  const renderLines = (data) => {
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <div key={index} className="profile-line">
          {item.value ? item.value.trim() : ''}
        </div>
      ));
    }
    return <div className="profile-line">{data}</div>;
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmation) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/user/data`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        localStorage.removeItem('token');
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error.message);
      }
    }
  };

  return (
    <div className="card1">
      <div >
        <h3>Personal Details</h3>
        <div className='user-details'>
          <div>
            <strong>Username:</strong>
            <span>{userData.displayname}</span>
          </div>
          <div>
            <strong>Email:</strong>
            <span>{userData.email}</span>
          </div>
          <div>
            {userData.profilePicture && (
              <div>
                <img src={userData.profilePicture} alt="Profile" className="profile-picture" />
              </div>
            )}
          </div>
        </div>
        <div className='details'>
          <Link to='/profiletab'>
            <button className='profiletab'>Add Personal Detail</button>
          </Link>
          <div>
            <Link to='/profiletab'>
              <FaUserEdit className='iconn' />
            </Link>
          </div>
        </div>
        {Object.keys(formData).length ? (
          <div className="profile-details">
            <div className="profile-field">
              <strong>Gender: </strong>
              <span>{formData.gender}</span>
            </div>
            {formData.attitude && (
              <div className="sub-card">
                <strong>Attitude: </strong>
                {renderLines(formData.attitude)}
              </div>
            )}
            {formData.strength && (
              <div className="sub-card">
                <strong>Strength: </strong>
                {renderLines(formData.strength)}
              </div>
            )}
            {formData.weakness && (
              <div className="sub-card">
                <strong>Weakness: </strong>
                {renderLines(formData.weakness)}
              </div>
            )}
            {formData.opportunity && (
              <div className="sub-card">
                <strong>Opportunity: </strong>
                {renderLines(formData.opportunity)}
              </div>
            )}
            {formData.threat && (
              <div className="sub-card">
                <strong>Threat: </strong>
                {renderLines(formData.threat)}
              </div>
            )}
          </div>
        ) : (
          <div>No data available</div>
        )}
      </div>
      <div className='data-around'>
        <div className='download-data'>
          <p>Download my data</p>
        </div>
        <div className='delete-account'>
          <p onClick={handleDeleteAccount}>Delete Account</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;