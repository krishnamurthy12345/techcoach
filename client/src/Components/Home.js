import React from 'react';
import './Login.css';
import Test from './assets/testimonial.png';
import Test1 from './assets/testimonial2.png';

const Home = () => {
  const loginwithgoogle = () => {
    window.open(`${process.env.REACT_APP_API_URL}/auth/google`, '_self');
  }
  return (
    <>
      <div className='home-container'>
        <div className='login-page'>
          <h1>Login</h1>
          <div className='form'>
            <button className='login-with-google-btn' onClick={loginwithgoogle}>Sign in with Google</button>
          </div>
        </div>
        <div className='test'>
          <img src={Test} alt='Testimonial' className='testimonial' /> 
          <img src={Test1} alt='Testimonial' className='testimonial2' /> 
        </div>
      </div>
    </>
  )
}

export default Home;
