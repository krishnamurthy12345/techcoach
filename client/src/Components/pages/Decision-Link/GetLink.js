import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './GetLink.css';
import { Link } from 'react-router-dom';

const GetLink = () => {
  const [skills, setSkills] = useState({});
  const [profiles, setProfiles] = useState({});

  const fetchMasterSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill/master-skills`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const groupedSkills = response.data.skills.reduce((acc, skill) => {
        if (!acc[skill.skill_name]) {
          acc[skill.skill_name] = [];
        }
        acc[skill.skill_name].push(skill.decision_name);
        return acc;
      }, {});
      setSkills(groupedSkills);
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/link`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const groupedSkills = response.data.skills.reduce((acc, skill) => {
        if (!acc[skill.skill_name]) {
          acc[skill.skill_name] = [];
        }
        acc[skill.skill_name].push(skill.decision_name);
        return acc;
      }, {});
      setSkills(groupedSkills);
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const fetchMasterProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/data/master-profiles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const groupedProfiles = response.data.profiles.reduce((acc, profile) => {
        if (!acc[profile.header_name]) {
          acc[profile.header_name] = [];
        }
        acc[profile.header_name].push(profile.decision_name);
        return acc;
      }, {});
      setProfiles(groupedProfiles);
    } catch (err) {
      console.error('Error fetching profiles:', err);
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
      const groupedProfiles = response.data.profiles.reduce((acc, profile) => {
        if (!acc[profile.header_name]) {
          acc[profile.header_name] = [];
        }
        acc[profile.header_name].push(profile.decision_name);
        return acc;
      }, {});
      setProfiles(groupedProfiles);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  };

  useEffect(() => {
    fetchMasterSkills();
    fetchSkills();
    fetchMasterProfiles();
    fetchProfiles();
  }, []);

  return (
    <div className='getlink'>
      <h4>Skills:</h4>
      <div className="skill-decision">
        {Object.keys(skills).map((skill_name, index) => (
          <div className="skill-decisions" key={index}>
            <h5><strong>{skill_name}</strong></h5>
            {skills[skill_name].map((decision_name, idx) => (
              <h6 key={idx}>{decision_name}</h6>
            ))}
          </div>
        ))}
      </div>

      <h4>Profiles:</h4>
      <div className="swot-decision">
        {Object.keys(profiles).map((header_name, index) => (
          <div className="swot-decisions" key={index}>
            <h5><strong>{header_name}</strong></h5>
            {profiles[header_name].map((decision_name, idx) => (
              <h6 key={idx}>{decision_name}</h6>
            ))}
          </div>
        ))}
      </div>

      <div>
        <Link to='/readd'>
          <button className='goback'>Go back Add Decisions</button>
        </Link>
      </div>
    </div>
  );
};

export default GetLink;
