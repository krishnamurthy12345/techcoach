// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';
// import './AdvancedProfile.css';

// const AdvancedProfile = () => {
//   const [advancedProfileData, setAdvancedProfileData] = useState({});

//   useEffect(() => {
//     const fetchData = async () => {
//       const token = localStorage.getItem('token');
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/data/advanced`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setAdvancedProfileData(response.data);
//         console.log('Fetched data:', response.data);
//       } catch (error) {
//         console.error('Error fetching data:', error.message);
//       }
//     };

//     fetchData();
//   }, []);

//   const renderSection = (title, data) => {
//     if (!data || !Array.isArray(data)) return null;

//     return (
//       <div className="advanced-section">
//         <strong>{title}:</strong>
//         <ul>
//           {data.map((item) => (
//             <li key={item.id}>{item.value}</li>
//           ))}
//         </ul>
//       </div>
//     );
//   };

//   return (
//     <div className="advanced-profile">
//       <div className="header">
//         <h3>Advanced Profile</h3>
//         <Link to='/advancedProfileTable'>
//           <button>
//             Add Profile
//           </button>
//         </Link>
//       </div>
//       <div className="sections">
//         {renderSection('Goals', advancedProfileData.goals)}
//         {renderSection('Values', advancedProfileData.values)}
//         {renderSection('Resolutions', advancedProfileData.resolutions)}
//         {renderSection('Constraints', advancedProfileData.constraints)}
//         {renderSection('OtherFactors', advancedProfileData['otherfactors'])}
//       </div>
//     </div>
//   );
// };

// export default AdvancedProfile;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdvancedProfile.css';

const AdvancedProfile = () => {
  const [advancedProfileData, setAdvancedProfileData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/data/advanced`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdvancedProfileData(response.data);
        console.log('Fetched data:', response.data);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, []);

  const renderSection = (title, data) => {
    if (!data || !Array.isArray(data)) return null;

    return (
      <div className="advanced-section">
        <strong>{title}:</strong>
        <ul>
          {data.map((item) => (
            <li key={item.id}>{item.value}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Check if data exists
  const hasData = () => {
    return Object.values(advancedProfileData).some(
      (data) => Array.isArray(data) && data.length > 0
    );
  };

  return (
    <div className="advanced-profile">
      <div className="header">
        <h4>Advanced Profile</h4>
        {hasData() ? (
          <Link to="/advancedProfileTable">
            <button>Update Profile</button>
          </Link>
        ) : (
          <Link to="/advancedProfileTable">
            <button>Add Profile</button>
          </Link>
        )}
      </div>
      <div className="sections">
        {renderSection('Goals', advancedProfileData.goals)}
        {renderSection('Values', advancedProfileData.values)}
        {renderSection('Resolutions', advancedProfileData.resolutions)}
        {renderSection('Constraints', advancedProfileData.constraints)}
        {renderSection('OtherFactors', advancedProfileData.otherfactors)}
      </div>
    </div>
  );
};

export default AdvancedProfile;
