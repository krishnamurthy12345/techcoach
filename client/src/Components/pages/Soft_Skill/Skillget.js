// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './Skillget.css';
// import { Link } from 'react-router-dom';

// const Skillget = () => {
//     const [skills, setSkills] = useState([]);
//     const [error, setError] = useState('');
//     const [message, setMessage] = useState('');

//     const fetchSkills = async () => {
//         try {
//             const token = localStorage.getItem('token'); 
//             const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             setSkills(response.data.skills); 
//         } catch (err) {
//             setError('Error fetching skill data');
//             console.log('Error fetching skill data:', err);
//         }
//     };

//     console.log("skilsssssssssssss", skills);
//     const handleDelete = async (id) => {
//         try {
//             const token = localStorage.getItem('token');
//             await axios.delete(`${process.env.REACT_APP_API_URL}/skill/${id}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             setMessage('Skill deleted successfully');
//             setTimeout(() => setMessage(''), 3000); 
//             fetchSkills(); 
//         } catch (err) {
//             setError('Error deleting skill data');
//             console.log('Error deleting skill data:', err);
//         }
//     };

//     const handleDeleteAll = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             await axios.delete(`${process.env.REACT_APP_API_URL}/skill`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             setMessage('All skills deleted successfully');
//             setTimeout(() => setMessage(''), 3000); 
//             fetchSkills(); 
//         } catch (err) {
//             setError('Error deleting all skills');
//             console.log('Error deleting all skills:', err);
//         }
//     };

//     useEffect(() => {
//         fetchSkills();
//     }, []);

//     return (
//         <div>
//             <h3 className="center">Soft Skills - Self Assessment</h3>
//             {skills.length === 0 && (
//                 <div>
//                     <Link to="/softskill">
//                         <button className='softskill-head'>Add Skills</button>
//                     </Link>
//                 </div>
//             )}
//             {message && <p className="message">{message}</p>}
//             {error && <p className="error">{error}</p>}
//             {skills.length > 0 && (
//                 <>
//                     <table className="table">
//                         <thead>
//                             <tr>
//                                 <th>Skill Name</th>
//                                 <th>Rating</th>
//                                 <th>Comments</th>
//                                 <th>Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {skills.map(skill => (
//                                 <tr key={skill.id}>
//                                     <td>{skill.skill_name}</td>
//                                     <td>{skill.rating}</td>
//                                     <td>{skill.comments}</td>
//                                     <td className='action'>
//                                         <Link to={`/editskill/${skill.id}`}>
//                                             <button className='edit'>Edit</button>
//                                         </Link>
//                                         <button className='delete' onClick={() => handleDelete(skill.id)}>Delete</button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                     <button className='deleteall' onClick={handleDeleteAll}>Delete All</button>
//                 </>
//             )}
//         </div>
//     );
// };

// export default Skillget;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Skillget.css';
import { Link } from 'react-router-dom';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const Skillget = () => {
  const [skills, setSkills] = useState([]);

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSkills(response.data.skills);
    } catch (err) {
      console.log('Error fetching skill data:', err);
      toast.error('Error fetching skill data');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/skill/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSkills();
      toast.success('Soft skill data deleted successfully');
    } catch (err) {
      toast.error('Error deleting soft skill data');
      console.log('Error deleting skill data:', err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/skill`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSkills();
      toast.success('All soft skills have been deleted successfully');
    } catch (err) {
      toast.error('Error deleting all soft skills');
      console.log('Error deleting all skills:', err);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return (
    <div>
      <h3 className="center mt-5">Soft Skills - Self Assessment</h3>
      <div>
        <Link to="/softskill">
          <button className='softskill-head'>Add Skills</button>
        </Link>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Skill Name</th>
            <th>Rating</th>
            <th>Assessment Notes and Action Plan</th>
            <th>Improvement</th>
          </tr>
        </thead>
        <tbody>
          {skills.map(skill => (
            <tr key={skill.id}>
              <td>{skill.skill_name}</td>
              <td>{skill.rating}</td>
              <td>{skill.comments}</td>
              <td className='action'>
                <Link to={`/editskill/${skill.id}`}>
                  <button className='edit'>Edit</button>
                </Link>
                <button className='delete' onClick={() => handleDelete(skill.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className='deleteall' onClick={handleDeleteAll}>Delete All</button>
      <ToastContainer />
    </div>
  );
};

export default Skillget;
