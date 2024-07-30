import React, { useEffect, useState } from 'react';
import './AddLink.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddLink = () => {
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showSkillOptions, setShowSkillOptions] = useState(false);
  const [isDropdown, setIsDropdown] = useState(true);
  const [activeSection, setActiveSection] = useState(null); // State to keep track of active section

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/data/master-profiles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched Profiles:', response.data.profiles);
      setProfiles(response.data.profiles);
    } catch (err) {
      console.log('Error fetching profile data:', err);
    }
  };

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill/master-skills`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched Skills:', response.data.skills);
      setSkills(response.data.skills.map(skill => ({ ...skill })));
    } catch (err) {
      console.log('Error fetching skill data:', err);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchSkills();
  }, []);

  const handleSWOTClick = () => {
    setShowProfileOptions(!showProfileOptions);
    setActiveSection('profile');
  };

  const handleSoftSkillClick = () => {
    setShowSkillOptions(!showSkillOptions);
    setActiveSection('skill');
  };

  const handleProfileChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedProfiles([...selectedProfiles, value]);
    } else {
      setSelectedProfiles(selectedProfiles.filter((id) => id !== value));
    }
  };

  const handleSkillChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedSkills([...selectedSkills, value]);
    } else {
      setSelectedSkills(selectedSkills.filter((id) => id !== value));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (activeSection === 'profiles') {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/user/data`, {
          profiles: selectedProfiles,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (activeSection === 'skills') {
        await axios.post(`${process.env.REACT_APP_API_URL}/skill`, {
          skills: selectedSkills,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      toast.success("Data Added Successfully");
      setTimeout(() => {
        // Optionally reset state or perform other actions
      }, 1500);
    } catch (err) {
      console.log('Error adding data:', err);
      toast.error("Error adding data");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className='addlink'>
        <div>
          <button type="button" className='swot' onClick={handleSWOTClick}>SWOT Analysis</button>
          {showProfileOptions && (
            <div className='options-container'>
              {isDropdown ? (
                <select multiple onChange={handleProfileChange}>
                  {profiles.map((profile) => (
                    <option key={profile.header_id} value={profile.header_id}>
                      {profile.header_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  {profiles.map((profile) => (
                    <div key={profile.header_id}>
                      <label htmlFor={`profile-${profile.header_id}`}>
                        {profile.header_name}
                        <input
                          type="checkbox"
                          id={`profile-${profile.header_id}`}
                          value={profile.header_id}
                          onChange={handleProfileChange}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <button type="button" className='soft-skill' onClick={handleSoftSkillClick}>Soft-Skill Assessment</button>
          {showSkillOptions && (
            <div className='options-container'>
              {isDropdown ? (
                <select multiple onChange={handleSkillChange}>
                  {skills.map((skill) => (
                    <option key={skill.skill_id} value={skill.skill_id}>
                      {skill.skill_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  {skills.map((skill) => (
                    <div key={skill.skill_id}>
                      <label htmlFor={`skill-${skill.skill_id}`}>
                        {skill.skill_name}
                        <input
                          type="checkbox"
                          id={`skill-${skill.skill_id}`}
                          value={skill.skill_id}
                          onChange={handleSkillChange}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <button type='submit' className='savebtn'>Save</button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddLink;
