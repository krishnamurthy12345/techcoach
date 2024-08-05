import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './GetLink.css';
import { Link } from 'react-router-dom';

const GetLink = () => {
  const [skills, setSkills] = useState([]);
  const [profiles, setProfiles] = useState([]);

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/link`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSkills(response.data.skills);
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/links`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfiles(response.data.profiles);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchProfiles();
  }, []);

  return (
    <div className='getlink'>
      <h2>Skills:</h2>
      {skills.length > 0 ? (
        <div className="card-container">
          {skills.map(skill => (
            <div className="card" key={skill.skill_id}>
              <p><strong>Decision Name:</strong> {skill.decision_name}</p>
              <p><strong>Skill Name:</strong> {skill.skill_name}</p>
              {skill.header_value && <p><strong>Header Value:</strong> {skill.header_value}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p>No skills found.</p>
      )}

      <h2>Profiles:</h2>
      {profiles.length > 0 ? (
        <div className="card-container">
          {profiles.map(profile => (
            <div className="card" key={profile.header_id}>
              <p><strong>Decision Name:</strong> {profile.decision_name}</p>
              <p><strong>Header Name:</strong> {profile.header_name}</p>
              {profile.header_value && <p><strong>Header Value:</strong> {profile.header_value}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p>No profiles found.</p>
      )}

      <div>
        <Link to='/readd'>
          <button className='goback'>Go back Add Decisions</button>
        </Link>
      </div>
    </div>
  );
};

export default GetLink;
