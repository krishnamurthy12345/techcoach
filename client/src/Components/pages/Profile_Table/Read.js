import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Read = () => {
  const [formData, setFormData] = useState({
    YearBorn: '',
    Gender: '',
    AddedDate: '',
    Type: '',
    Strength1: '',
    Strength2: '',
    Skill: '',
    Attitude: '',
    Weakness: '',
    Communication: '',
    Opportunity: '',
    Threat: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(`{process.env.REACT_APP_API_URL}/profile`, formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Data inserted successfully:', response.data);
        navigate('/dashboard'); 
    } catch (error) {
        console.error('Error inserting data:', error.message);
    }
};

  return (
    <>
      <form onSubmit={handleSubmit}>
        <center><table>
          <tbody>
            <tr>
              <th>Year Born:</th>
              <td><input type="text" name="YearBorn" value={formData.YearBorn} onChange={handleChange} placeholder="Year Born" /></td>
            </tr>
            <tr>
              <th>Gender:</th>
              <td>
                <input type="radio" id="male" name="Gender" value="male" checked={formData.Gender === "male"} onChange={handleChange} />
                <label htmlFor="male">Male</label>
                <input type="radio" id="female" name="Gender" value="female" checked={formData.Gender === "female"} onChange={handleChange} />
                <label htmlFor="female">Female</label>
                <input type="radio" id="other" name="Gender" value="other" checked={formData.Gender === "other"} onChange={handleChange} />
                <label htmlFor="other">Other</label>
              </td>
            </tr>
            <tr>
              <th>Added Date:</th>
              <td><input type="text" name="AddedDate" value={formData.AddedDate} onChange={handleChange} placeholder="Added Date" /></td>
            </tr>
            <tr>
              <th>Type:</th>
              <td><input type="text" name="Type" value={formData.Type} onChange={handleChange} placeholder="Type" /></td>
            </tr>
            <tr>
              <th>Strength1:</th>
              <td><input type="text" name="Strength1" value={formData.Strength1} onChange={handleChange} placeholder="Strength1" /></td>
            </tr>
            <tr>
              <th>Strength2:</th>
              <td><input type="text" name="Strength2" value={formData.Strength2} onChange={handleChange} placeholder="Strength2" /></td>
            </tr>
            <tr>
              <th>Skill:</th>
              <td><input type="text" name="Skill" value={formData.Skill} onChange={handleChange} placeholder="Skill" /></td>
            </tr>
            <tr>
              <th>Attitude:</th>
              <td><input type="text" name="Attitude" value={formData.Attitude} onChange={handleChange} placeholder="Attitude" /></td>
            </tr>
            <tr>
              <th>Weakness:</th>
              <td><input type="text" name="Weakness" value={formData.Weakness} onChange={handleChange} placeholder="Weakness" /></td>
            </tr>
            <tr>
              <th>Communication:</th>
              <td><input type="text" name="Communication" value={formData.Communication} onChange={handleChange} placeholder="Communication" /></td>
            </tr>
            <tr>
              <th>Opportunity:</th>
              <td><input type="text" name="Opportunity" value={formData.Opportunity} onChange={handleChange} placeholder="Opportunity" /></td>
            </tr>
            <tr>
              <th>Threat:</th>
              <td><input type="text" name="Threat" value={formData.Threat} onChange={handleChange} placeholder="Threat" /></td>
            </tr>
          </tbody>
        </table>
          <button type="submit">Submit</button>
        </center>
      </form>
    </>
  );
};

export default Read;
