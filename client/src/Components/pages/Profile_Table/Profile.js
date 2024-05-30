import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/data`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };
    loadData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderLines = (data) => {
    if (typeof data === 'string') {
      return data.split(',').map((line, index) => (
        <div key={index} className="profile-line">
          {line.trim()}
        </div>
      ));
    }
    return <div className="profile-line">{data}</div>;
  };

  return (
    <div className="card">
      <h3>Personal Details</h3>
      <Link to='/profiletab'>
        <button className='profiletab'>Add Personal Detail</button>
      </Link>
      {Object.keys(formData).length ? (
        <div className="profile-details">
          <div className="profile-field">
            <strong>Date of Birth: </strong>
            <span>{formatDate(formData.dob)}</span>
          </div>
          <div className="profile-field">
            <strong>Gender: </strong>
            <span>{formData.gender}</span>
          </div>
          <div className="profile-field">
            <strong>Added Date: </strong>
            <span>{formatDate(formData.created_at)}</span>
          </div>
          {formData.skill && (
            <div className="sub-card">
              <strong>Skill: </strong>
              {renderLines(formData.skill.join(','))}
            </div>
          )}
          {formData.weakness && (
            <div className="sub-card">
              <strong>Weakness: </strong>
              {renderLines(formData.weakness.join(','))}
            </div>
          )}
          {formData.communication && (
            <div className="sub-card">
              <strong>Communication: </strong>
              {renderLines(formData.communication.join(','))}
            </div>
          )}
          {formData.strength && (
            <div className="sub-card">
              <strong>Strength: </strong>
              {renderLines(formData.strength.join(','))}
            </div>
          )}
          {formData.opportunity && (
            <div className="sub-card">
              <strong>Opportunity: </strong>
              {renderLines(formData.opportunity.join(','))}
            </div>
          )}
          {formData.threat && (
            <div className="sub-card">
              <strong>Threat: </strong>
              {renderLines(formData.threat.join(','))}
            </div>
          )}
        </div>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
};

export default Profile;
