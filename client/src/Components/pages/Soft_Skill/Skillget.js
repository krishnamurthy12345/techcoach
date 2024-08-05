import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Skillget.css';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import withAuth from '../../withAuth';

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
        {skills.length === 0 && (
          <Link to="/softskill">
            <button className='softskill-head'>Add Skills</button>
          </Link>
        )}
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
      {skills.length > 0 && (
        <button className='deleteall' onClick={handleDeleteAll}>Delete All</button>
      )}
      <ToastContainer />
    </div>
  );
};

export default withAuth(Skillget);
