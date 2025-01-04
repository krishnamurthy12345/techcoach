// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './GetLink.css';
// import { Link } from 'react-router-dom';
// import { TiDelete } from "react-icons/ti";
// import { toast, ToastContainer } from 'react-toastify';
// import withAuth from '../../withAuth';
// import BubbleChart from '../Decision/Views/BubbleChart';

// const GetLink = () => {
//   const [profiles, setProfiles] = useState({});
//   const [skills, setSkills] = useState({});
//   const [advancedProfiles, setAdvancedProfiles] = useState({});

//   const handleBubbleClick = (data) => {
//     console.log('Selected Bubble Data:', data);
//   };

//   const fetchProfiles = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/links`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setProfiles(response.data);
//       console.log('Fetched profiles:', response.data);
//     } catch (err) {
//       console.error('Error fetching profiles:', err);
//     }
//   };

//   const fetchAdvancedProfiles = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/link/advancedLink`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setAdvancedProfiles(response.data);
//       console.log('Fetched AdvancedProfiles:', response.data);
//     } catch (err) {
//       console.error('Error fetching profiles:', err);
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
//       setSkills(response.data);
//       console.log('Fetched Skills:', response.data);
//     } catch (err) {
//       console.error('Error fetching skills:', err)
//     }
//   }

//   useEffect(() => {
//     fetchProfiles();
//     fetchSkills();
//     fetchAdvancedProfiles();
//   }, []);

//   // Grouping profiles by header_name and header_value
//   const groupedProfiles = Object.entries(profiles).reduce((acc, [header_name, decisions]) => {
//     decisions.forEach(decision => {
//       const key = `${decision.header_name}|${decision.header_value}`;
//       if (!acc[key]) {
//         acc[key] = { header_name: decision.header_name, header_value: decision.header_value, decisions: [] };
//       }
//       acc[key].decisions.push(decision);
//     });
//     return acc;
//   }, {});


//   const groupedAdvancedProfiles = Object.entries(advancedProfiles).reduce((acc, [header_name, decisions]) => {
//     decisions.forEach(decision => {
//       const key = `${decision.header_name}|${decision.header_value}`;
//       if (!acc[key]) {
//         acc[key] = { header_name: decision.header_name, header_value: decision.header_value, decisions: [] };
//       }
//       acc[key].decisions.push(decision);
//     });
//     return acc;
//   }, {});


//   const groupedSkills = Object.entries(skills).reduce((acc, [skill_name, decisions]) => {
//     decisions.forEach(decision => {
//       const key = `${decision.skill_name}|${decision.skill_value}`;
//       if (!acc[key]) {
//         acc[key] = { skill_name: decision.skill_name, skill_value: decision.skill_value, decisions: [] };
//       }
//       acc[key].decisions.push(decision);
//     });
//     return acc;
//   }, {});

//   const handleDeleteSwot = async (decision_id) => {
//     if (window.confirm('Are you sure that you want to delete this decision-link ?')) {
//       try {
//         const token = localStorage.getItem('token');
//         await axios.delete(`${process.env.REACT_APP_API_URL}/api/links/${decision_id}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         toast.success('Decision-SWOT-link deleted successfully');
//         fetchProfiles();
//       } catch (error) {
//         console.error('Error deleting decision-link:', error);
//         toast.error('An error occurred while deleting the decision-link');
//       }
//     }
//   };

//   const handleDeleteSkill = async (decision_id) => {
//     if (window.confirm('Are you sure that you want to delete this decision-link?')) {
//       try {
//         const token = localStorage.getItem('token');
//         await axios.delete(`${process.env.REACT_APP_API_URL}/api/link/${decision_id}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         toast.success('Decision-Skill-link deleted successfully');
//         fetchSkills();
//       } catch (error) {
//         console.error('Error deleting decision-link:', error);
//         toast.error('An error occurred while deleting the decision-link');
//       }
//     }
//   };


//   return (
//     <div className='getlink'>
//       <BubbleChart profiles={profiles} skills={skills} onBubbleClick={handleBubbleClick} />
//       <h3 className='getLink-heading'>Profiles</h3>
//       <div className="swot-decision">
//         {Object.values(groupedProfiles).map((group, index) => (
//           <div
//             className={`swot-decisions ${group.header_name === 'Opportunity' ? 'opportunity-card' : group.header_name === 'Threat' ? 'threat-card' : ''
//               }`}
//             key={index}
//           >
//             <h5><strong>{group.header_name}</strong></h5>
//             <h6><strong>SWOT values:</strong>{group.header_value}</h6>
//             {group.decisions.map((decision, idx) => (
//               <p key={idx}>
//                 <strong>Decision Name:</strong> {decision.decision_name}
//                 <TiDelete className='fs-4' onClick={() => handleDeleteSwot(decision.decision_id)} />
//               </p>
//             ))}
//           </div>
//         ))}
//       </div>

//       <h3 className='getLink-heading'>Advanced Profiles</h3>
//       <div className="swot-decision">
//         {Object.values(groupedAdvancedProfiles).map((group, index) => (
//           <div className='swot-decisions' key={index} >
//             <h5><strong>{group.header_name}</strong></h5>
//             <h6><strong>GVRCO values:</strong>{group.header_value}</h6>
//             {group.decisions.map((decision, idx) => (
//               <p key={idx}>
//                 <strong>Decision Name:</strong> {decision.decision_name}
//                 <TiDelete className='fs-4' onClick={() => handleDeleteSwot(decision.decision_id)} />
//               </p>
//             ))}
//           </div>
//         ))}
//       </div>

//       <h3 className='getLink-heading'>Soft Skills</h3>
//       <div className='skill-decision'>
//         {Object.values(groupedSkills).map((group, index) => (
//           <div className='skill-decisions' key={index}>
//             <h5><strong>{group.skill_name}</strong></h5>
//             {group.decisions.map((decision, idx) => (
//               <p key={idx}><strong>Decision Name:</strong>{decision.decision_name}
//                 <TiDelete className='fs-4' onClick={() => handleDeleteSkill(decision.decision_id)} />
//               </p>
//             ))}
//           </div>
//         ))}
//       </div>

//       <div>
//         <Link to='/readd'>
//           <button className='goback'>Go back Add Decisions</button>
//         </Link>
//       </div>
//       <ToastContainer />
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
import BubbleChart from '../Decision/Views/BubbleChart';

const GetLink = () => {
  const [profiles, setProfiles] = useState({});
  const [skills, setSkills] = useState({});
  const [advancedProfiles, setAdvancedProfiles] = useState({});
  const [selectedFilter, setSelectedFilter] = useState(null); 

  const handleBubbleClick = (data) => {
    console.log('Selected Bubble Data:', data);
    setSelectedFilter(data);
  };

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

  const fetchAdvancedProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/link/advancedLink`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdvancedProfiles(response.data);
      console.log('Fetched AdvancedProfiles:', response.data);
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
    fetchAdvancedProfiles();
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


  const groupedAdvancedProfiles = Object.entries(advancedProfiles).reduce((acc, [header_name, decisions]) => {
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

  const filteredProfiles = selectedFilter
    ? Object.values(groupedProfiles).filter(profile =>
        profile.header_name === selectedFilter.metadata.header_name
      )
    : Object.values(groupedProfiles);

    const filteredAdvancedProfiles = selectedFilter
    ? Object.values(groupedAdvancedProfiles).filter(profile =>
        profile.header_name === selectedFilter.metadata.header_name
      )
    : Object.values(groupedAdvancedProfiles);  

  const filteredSkills = selectedFilter
    ? Object.values(groupedSkills).filter(skill =>
        skill.skill_name === selectedFilter.metadata.skill_name
      )
    : Object.values(groupedSkills);

    

  return (
    <div className='getlink'>
      <BubbleChart profiles={profiles} skills={skills} onBubbleClick={handleBubbleClick} />
      <h3 className='getLink-heading'>Profiles</h3>
      <div className="swot-decision">
        {filteredProfiles.map((group, index) => (
          <div
            className={`swot-decisions ${group.header_name === 'Opportunity' ? 'opportunity-card' : group.header_name === 'Threat' ? 'threat-card' : ''
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

      <h3 className='getLink-heading'>Advanced Profiles</h3>
      <div className="swot-decision">
        {filteredAdvancedProfiles.map((group, index) => (
          <div className='swot-decisions' key={index} >
            <h5><strong>{group.header_name}</strong></h5>
            <h6><strong>GVRCO values:</strong>{group.header_value}</h6>
            {group.decisions.map((decision, idx) => (
              <p key={idx}>
                <strong>Decision Name:</strong> {decision.decision_name}
                <TiDelete className='fs-4' onClick={() => handleDeleteSwot(decision.decision_id)} />
              </p>
            ))}
          </div>
        ))}
      </div>

      <h3 className='getLink-heading'>Soft Skills</h3>
      <div className='skill-decision'>
        {filteredSkills.map((group, index) => (
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