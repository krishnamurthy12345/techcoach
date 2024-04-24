import React, { useState } from 'react';
import { BiShowAlt, BiHide } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Basic_Inform.css';

const BasicInform = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    image: ''
  });

  const handleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleConfirmShowPassword = () => {
    setShowConfirmPassword(prev => !prev);
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfileImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setData(prev => ({
        ...prev,
        image: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users`, data);
      console.log('User data submitted:', response.data);
      setAlertMessage('Form submitted successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error submitting user data:', error);
      setAlertMessage('Error submitting form. Please try again.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const userId = 1; // Replace this with the actual user ID
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, data);
      console.log('User data updated:', response.data);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <div className='container'>
      <div className='form'>
        {/* <h1 className='title'>SignUp</h1> */}
        {alertMessage && <div className="alert">{alertMessage}</div>}
        <div className='image-upload'>
          {data.image ? (
            <img src={data.image} alt='' />
          ) : (
            <div className='no-image'>
              <p>No image uploaded</p>
            </div>
          )}
          <label htmlFor='profileImage'>
            <div className='upload-button'>
              <p>Upload</p>
            </div>
            <input type='file' id='profileImage' accept='image/*' onChange={handleUpdateProfileImage} />
          </label>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='form-fields'>
            <label htmlFor='firstName'>First Name</label>
            <input type='text' id='firstName' name='firstName' value={data.firstName} onChange={handleOnChange} />
            <label htmlFor='lastName'>Last Name</label>
            <input type='text' id='lastName' name='lastName' value={data.lastName} onChange={handleOnChange} />
            <label htmlFor='email'>Email</label>
            <input type='email' id='email' name='email' value={data.email} onChange={handleOnChange} />
            <div className='password-field'>
              <label htmlFor='password'>Password</label>
              <input type={showPassword ? 'text' : 'password'} id='password' name='password' value={data.password} onChange={handleOnChange} />
              <span className='toggle-password' onClick={handleShowPassword}>{showPassword ? <BiShowAlt /> : <BiHide />}</span>
            </div>
            <label htmlFor='confirmPassword'>Confirm Password</label>
            <div className='password-field'>
              <input type={showConfirmPassword ? 'text' : 'password'} id='confirmPassword' name='confirmPassword' value={data.confirmPassword} onChange={handleOnChange} />
              <span className='toggle-password' onClick={handleConfirmShowPassword}>{showConfirmPassword ? <BiShowAlt /> : <BiHide />}</span>
            </div>
            {/* <button type='submit1' className='submit1'>Sign Up</button> */}
            <button type='submit1' className='submit1' onClick={handleUpdate}>Update</button>
          </div>
        </form>
        {/* <p className='login-link'>Already have an Account? <Link to={'/login'}>Login</Link></p> */}
      </div>
    </div>
  );
};

export default BasicInform;
