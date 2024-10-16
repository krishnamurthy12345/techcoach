// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './GetLink.css';
// import { Link } from 'react-router-dom';
// import withAuth from '../../withAuth';

// const GetLink = () => {
//   const [skills, setSkills] = useState({});
//   const [profiles, setProfiles] = useState([]);

//   const fetchMasterSkills = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill/master-skills`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const groupedSkills = response.data.skills.reduce((acc, skill) => {
//         if (!acc[skill.skill_name]) {
//           acc[skill.skill_name] = [];
//         }
//         acc[skill.skill_name].push(skill.decision_name);
//         return acc;
//       }, {});
//       setSkills(groupedSkills);
//     } catch (err) {
//       console.error('Error fetching skills:', err);
//     }
//   };

//   const fetchSkills = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/link`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const groupedSkills = response.data.skills.reduce((acc, skill) => {
//         if (!acc[skill.skill_name]) {
//           acc[skill.skill_name] = [];
//         }
//         acc[skill.skill_name].push(skill.decision_name);
//         return acc;
//       }, {});
//       setSkills(groupedSkills);
//     } catch (err) {
//       console.error('Error fetching skills:', err);
//     }
//   };

//   const fetchMasterProfiles = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/data/master-profiles`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const groupedProfiles = response.data.profiles.reduce((acc, profile) => {
//         if (!acc[profile.header_name]) {
//           acc[profile.header_name] = [];
//         }
//         acc[profile.header_name].push(profile.decision_name);
//         return acc;
//       }, {});
//       setProfiles(groupedProfiles);
//     } catch (err) {
//       console.error('Error fetching profiles:', err);
//     }
//   };

//   const fetchProfiles = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/links`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const groupedProfiles = response.data.profiles.reduce((acc, profile) => {
//         if (!acc[profile.header_name]) {
//           acc[profile.header_name] = [];
//         }
//         acc[profile.header_name].push(profile.decision_name);
//         return acc;
//       }, {});
//       setProfiles(groupedProfiles);
//     } catch (err) {
//       console.error('Error fetching profiles:', err);
//     }
//   };

//   useEffect(() => {
//     fetchMasterSkills();
//     fetchSkills();
//     fetchMasterProfiles();
//     fetchProfiles();
//   }, []);

//   return (
//     <div className='getlink'>
//       <h4>Skills:</h4>
//       <div className="skill-decision">
//         {Object.keys(skills).map((skill_name, index) => (
//           <div className="skill-decisions" key={index}>
//             <h5><strong>{skill_name}</strong></h5>
//             {skills[skill_name].map((decision_name, idx) => (
//               <h6 key={idx}>{decision_name}</h6>
//             ))}
//           </div>
//         ))}
//       </div>

//       <h4>Profiles:</h4>
//       <div className="swot-decision">
//         {Object.keys(profiles).map((header_name, index) => (
//           <div className="swot-decisions" key={index}>
//             <h5><strong>{header_name}</strong></h5>
//             {profiles[header_name].map((decision_name, idx) => (
//               <h6 key={idx}>{decision_name}</h6>
//             ))}
//           </div>
//         ))}
//       </div>

//       <div>
//         <Link to='/readd'>
//           <button className='goback'>Go back Add Decisions</button>
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default withAuth(GetLink);


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './GetLink.css';
import { Link } from 'react-router-dom';
import { TiDelete } from "react-icons/ti";
import { toast, ToastContainer } from 'react-toastify';
import withAuth from '../../withAuth';

const GetLink = () => {
  const [profiles, setProfiles] = useState({});
  const [skills, setSkills] = useState({});

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/links`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfiles(response.data);
      console.log('Fetched profiles:', response.data);
    } catch (err) {
      console.error('Error fetching profiles:', err);
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
      setSkills(response.data);
      console.log('Fetched Skills:', response.data);
    } catch (err) {
      console.error('Error fetching skills:', err)
    }
  }

  useEffect(() => {
    fetchProfiles();
    fetchSkills();
  }, []);

  // Grouping profiles by header_name and header_value
  const groupedProfiles = Object.entries(profiles).reduce((acc, [header_name, decisions]) => {
    decisions.forEach(decision => {
      const key = `${decision.header_name}|${decision.header_value}`;
      if (!acc[key]) {
        acc[key] = { header_name: decision.header_name, header_value: decision.header_value, decisions: [] };
      }
      acc[key].decisions.push(decision);
    });
    return acc;
  }, {});

  const groupedSkills = Object.entries(skills).reduce((acc, [skill_name, decisions]) => {
    decisions.forEach(decision => {
      const key = `${decision.skill_name}|${decision.skill_value}`;
      if (!acc[key]) {
        acc[key] = { skill_name: decision.skill_name, skill_value: decision.skill_value, decisions: [] };
      }
      acc[key].decisions.push(decision);
    });
    return acc;
  }, {});

  const handleDeleteSwot = async (decision_id) => {
    if (window.confirm('Are you sure that you want to delete this decision-link ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/links/${decision_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Decision-SWOT-link deleted successfully');
        fetchProfiles();
      } catch (error) {
        console.error('Error deleting decision-link:', error);
        toast.error('An error occurred while deleting the decision-link');
      }
    }
  };

  const handleDeleteSkill = async (decision_id) => {
    if (window.confirm('Are you sure that you want to delete this decision-link?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/link/${decision_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Decision-Skill-link deleted successfully');
        fetchSkills(); 
      } catch (error) {
        console.error('Error deleting decision-link:', error);
        toast.error('An error occurred while deleting the decision-link');
      }
    }
  };


  return (
    <div className='getlink'>
      <h3>Profiles</h3>
      <div className="swot-decision">
        {Object.values(groupedProfiles).map((group, index) => (
          <div
            className={`swot-decisions ${
              group.header_name === 'Opportunity' ? 'opportunity-card' : group.header_name === 'Threat' ? 'threat-card' : ''
            }`}
            key={index}
          >
            <h5><strong>{group.header_name}</strong></h5>
            <h6><strong>SWOT values:</strong>{group.header_value}</h6>
            {group.decisions.map((decision, idx) => (
              <p key={idx}>
                <strong>Decision Name:</strong> {decision.decision_name}
                <TiDelete className='fs-4' onClick={() => handleDeleteSwot(decision.decision_id)} />
              </p>
            ))}
          </div>
        ))}
      </div>

      <h3 className='mt-3'>Soft Skills</h3>
      <div className='skill-decision'>
        {Object.values(groupedSkills).map((group, index) => (
          <div className='skill-decisions' key={index}>
            <h5><strong>{group.skill_name}</strong></h5>
            {group.decisions.map((decision, idx) => (
              <p key={idx}><strong>Decision Name:</strong>{decision.decision_name}
                <TiDelete className='fs-4' onClick={() => handleDeleteSkill(decision.decision_id)} />
              </p>
            ))}
          </div>
        ))}
      </div>

      <div>
        <Link to='/readd'>
          <button className='goback'>Go back Add Decisions</button>
        </Link>
      </div>
      <ToastContainer />
    </div>
  );
};

export default withAuth(GetLink);
