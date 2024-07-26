import React, { useState } from 'react';
import './Soft_Skill.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdDescription } from 'react-icons/md';

const SoftSkill = () => {
  const [skills, setSkills] = useState([
    { skill_name: 'Verbal Communication', rating: '', comments: '', description: 'Ability to speak English fluently with colleagues and customers.', showDescription: false },
    { skill_name: 'Written Communication', rating: '', comments: '', description: 'Ability to write fluently in English for emails, chats, and documents with good vocabulary usage.', showDescription: false }
  ]);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (index, event) => {
    const values = [...skills];
    values[index][event.target.name] = event.target.value;
    setSkills(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/skill`, { skills });
      navigate('/skillget');
    } catch (err) {
      setError('Error adding skill data');
      console.log('Error adding skill data:', err);
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
        <table className='table '>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Skill Name</th>
              <th>Rating (1-10)</th>
              <th>Confidence Level</th>
              <th>Our Comments</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill, index) => (
              <tr key={index}>
                <td>{index + 1}.</td>
                <td>
                  <div className='skill-container'>
                    <span>{skill.skill_name}</span>
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
                    value={skill.rating}
                    onChange={(event) => handleChange(index, event)}
                  />
                </td>
                <td>{getConfidenceLevel(skill.rating)}</td>
                <td>
                  <textarea
                    className='textarea'
                    name='comments'
                    value={skill.comments}
                    onChange={(event) => handleChange(index, event)}
                  ></textarea>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type='submit' className='btn btn-light bg-dark'>Submit</button>
      </form>
      {error && <p className='error'>{error}</p>}
    </div>
  );
};

export default SoftSkill;

