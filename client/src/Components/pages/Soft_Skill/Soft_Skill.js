import React, { useEffect, useState } from 'react';
import './Soft_Skill.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdDescription } from 'react-icons/md';
import { ToastContainer, toast } from 'react-toastify';
import withAuth from '../../withAuth';

const SoftSkill = () => {
  const [skills, setSkills] = useState([]);
  const navigate = useNavigate();

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/skill/master-skills`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched skills:', response.data.skills); 
      setSkills(response.data.skills.map(skill => ({ ...skill, showDescription: false, rating: '', comments: '' })));
    } catch (err) {
      console.log('Error fetching skill data:', err);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleChange = (index, event) => {
    const values = [...skills];
    // Handle change based on the input name
    if (event.target.name === 'rating') {
      values[index][event.target.name] = parseInt(event.target.value, 10);
    } else if (event.target.name === 'comments') {
      values[index][event.target.name] = event.target.value;
    }
    setSkills(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/skill`, { skills });
      toast("Soft Skill Added Successfully");
      setTimeout(() =>{
      navigate('/skillget');
    },1500);
    } catch (err) {
      console.log('Error adding skill data:', err);
      toast("Error adding Soft Skill data");
    }
  };

  const toggleDescription = (index) => {
    const values = [...skills];
    values[index].showDescription = !values[index].showDescription;
    setSkills(values);
  };

  const getConfidenceLevel = (rating) => {
    if (rating >= 1 && rating <= 4) return 'Not very confident';
    if (rating >= 5 && rating <= 8) return 'Slightly Confident';
    if (rating >= 9 && rating <= 10) return 'Highly Confident';
    return '';
  };

  return (
    <div>
      <h3 className='center mt-5'>Soft Skills - Self Assessment</h3>
      <form className='form' onSubmit={handleSubmit}>
        <table className='table'>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Skill Name</th>
              <th>Rating (1-10)</th>
              <th>Confidence Level</th>
              <th>Assessment Notes and Action Plan</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill, index) => (
              <tr key={index}>
                <td>{index + 1}.</td>
                <td>
                  <div className='skill-container'>
                    <span>{skill.skill_name}  <span className="required" style={{ color: "red" }}>*</span></span>
                    <MdDescription
                      className='show-description-icon'
                      onClick={() => toggleDescription(index)}
                    />
                    {skill.showDescription && (
                      <p className='description'>
                        Description: {skill.description}
                      </p>
                    )}
                  </div>
                </td>
                <td>
                  <input
                    type='number'
                    min='1'
                    max='10'
                    name='rating'
                    value={skill.rating || ''}
                    onChange={(event) => handleChange(index, event)}
                  />
                </td>
                <td>{getConfidenceLevel(skill.rating)}</td>
                <td>
                  <textarea
                    className='textarea'
                    name='comments'
                    value={skill.comments || ''}
                    onChange={(event) => handleChange(index, event)}
                  ></textarea>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type='submit' className='btn btn-light bg-dark'>Submit</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default withAuth(SoftSkill);
