import React, { useEffect, useState } from 'react';
import './AddLink.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../withAuth';
import { useNavigate, Link, useParams,useLocation } from 'react-router-dom';

const AddLink = () => {
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showSkillOptions, setShowSkillOptions] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const decision_name = params.get('name');


  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/data/master-profiles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      setSkills(response.data.skills);
    } catch (err) {
      console.log('Error fetching skill data:', err);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchSkills();
  }, [id]);

  const handleSWOTClick = () => {
    setShowProfileOptions(!showProfileOptions);
  };

  const handleSoftSkillClick = () => {
    setShowSkillOptions(!showSkillOptions);
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

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/links`, {
        header_ids: selectedProfiles,
        decision_id: id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Profiles Linked Successfully");
      navigate('/getall');
    } catch (err) {
      console.log('Error linking profiles:', err);
      toast.error("Error adding profile link");
    }
  };

  const handleSkillSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/link`, {
        skill_ids: selectedSkills,
        decision_id: id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Skill link added successfully");
      navigate('/getall');
    } catch (err) {
      console.error('Error adding skill link:', err);
      toast.error("Error adding skill link");
    }
  };

  return (
    <div className='addlink'>
        <center>
        <div className='bg-secondary text-white rounded p-2'>
        <h4>{decision_name}</h4>
        <input
          type="text"
          placeholder="Decision Name"
          value={id}
          readOnly
        />
        </div>
        </center>
      <div>
        <div>
          <button type="button" className='swot' onClick={handleSWOTClick}>SWOT Analysis</button>
          {showProfileOptions && (
            <div className='options'>
              {profiles.map((profile) => (
                <div key={profile.header_id}>
                  <label htmlFor={`profile-${profile.header_id}`}>
                    <input
                      type="checkbox"
                      id={`profile-${profile.header_id}`}
                      value={profile.header_id}
                      onChange={handleProfileChange}
                    />
                    {profile.header_name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type='submit' onClick={handleProfileSubmit} className='savebtn'>Save SWOT Link</button>
      </div>
      <div>
        <div>
          <button type='button' className='soft-skill' onClick={handleSoftSkillClick}>Soft-Skills Analysis</button>
          {showSkillOptions && (
            <div className='options-container'>
              {skills.map((skill) => (
                <div key={skill.skill_id}>
                  <label htmlFor={`skill-${skill.skill_id}`}>
                    <input
                      type="checkbox"
                      id={`skill-${skill.skill_id}`}
                      value={skill.skill_id}
                      onChange={handleSkillChange}
                    />
                    {skill.skill_name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type='submit' className='savebtn' onClick={handleSkillSubmit}>Save Soft-Skill Link</button>
      </div>
      <div>
        <Link to='/getall'>
          <button className='getpage'>
            Go to GetLink Page
          </button>
        </Link>
      </div>
      <ToastContainer />
    </div>
  );
};

export default withAuth(AddLink);
