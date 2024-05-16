import React from 'react';
import './Login.css';
import Test from './assets/testimonial.png';


const Home = () => {
  const loginwithgoogle = () => {
    window.open(`${process.env.REACT_APP_API_URL}/auth/google`, '_self');
  }
  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <div>
          <div className='login-page'>
            <h1 style={{ textAlign: 'center' }}>Login</h1>
            <div className='form'>
              <button className='login-with-google-btn' onClick={loginwithgoogle}>Sign in with Google</button>
            </div>
          </div>
        </div>
        <div className='test'>
          <img src={Test} alt='' className='testimonial' /> 
        </div>
      </div>
    </>
  )
}

export default Home