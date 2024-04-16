// import React, { useState } from 'react';
// import './Nav.css';
// import { Link } from 'react-router-dom';
// import { BsFillBellFill, BsFillEnvelopeFill, BsPersonCircle } from 'react-icons/bs';

// function Dashboard() {
//   const [navCollapse, setNavCollapse] = useState(false);

//   // Function to handle navigation when an option is selected
//   const handleProfileSelect = (event) => {
//     const selectedOption = event.target.value;
//     if (selectedOption === 'basic') {
//       // Navigate to the Basic Information route
//       window.location.href = '/basic';
//     } else if (selectedOption === 'personal') {
//       // Navigate to the Personal Info route
//       window.location.href = '/personal';
//     }
//   };

//   return (
//     <div>
//       <nav className='nav'>
//         <div className='logo'>
//           <i className='bi bi-justify largeDeviceIcon' onClick={() => setNavCollapse(!navCollapse)}></i>
//         </div>
//         <ul>
//           <li><Link to='/readd'><BsFillEnvelopeFill className='icon' /> Decision</Link></li>
//           <li><Link to='/notification'><BsFillBellFill className='icon' /> Notification</Link></li>
//           <li>
//             <BsPersonCircle className='icon' />
//             Profile
//             <select onChange={handleProfileSelect}>
//               <option value=""></option>
//               <option value="basic">Basic Information</option>
//               <option value="personal">Personal info</option>
//             </select>
//           </li>
//         </ul>
//       </nav>
//     </div>
//   );
// }

// export default Dashboard;


import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Nav = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(()=>{
  const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/`,{
          headers:{
            Authorization: `Bearer ${token}`
          }
        });
        const responseData = response.data;
        // console.log("getdata:",response);
        console.log("Response Data:", responseData);
        if (Array.isArray(responseData.decisionData)) {
          setData(responseData.decisionData);
        } else {
          console.error("Invalid response format:",responseData);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
  
      }
    };

    loadData();
  },[]);


  const filteredData = data.filter(decision => {
    return (
      (decision.decision_name && decision.decision_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (decision.tag_name && decision.tag_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  console.log('Filtered Data:', filteredData);
  return (
    <div>
      {/* {error && <p>{error}</p>}  */}
      <table className='styled-table'>
        <thead>
          <tr>
            <th>#</th>
            <th>Decision Name</th>
            <th>Decision Due Date</th>
            <th>Decision Taken Date</th>
            <th>User Statement</th>
            <th>Tags</th>
            <th>Decision Reasons</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((decision, index) => (
            <tr key={decision.decision_id}>
              <th scope='row'>{index + 1}</th>
              <td>{decision.decision_name}</td>
              <td>{decision.decision_due_date}</td>
              <td>{decision.decision_taken_date}</td>
              <td>{decision.user_statement}</td>
              <td>
                {decision.tag_name && decision.tag_name.split(',').map(tag => (
                  <div key={tag}>{tag}</div>
                ))}
              </td>
              <td>
                {decision.decision_reason_text && decision.decision_reason_text.split(',').map(reason => (
                  <div key={reason}>{reason}</div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Nav;
