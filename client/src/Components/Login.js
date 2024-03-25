import React, { useEffect } from 'react';
import './Login.css';

const Login = () => {

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.location.href = '/dashboard';
    }
  }, []);

  const loginwithgoogle = () => {
    window.open(`${process.env.REACT_APP_API_URL}/auth/google`, '_self');
  }

  return (
    <div className='login-page'>
      <h1 style={{ textAlign: 'center' }}>Login</h1>
      <div className='form'>
        <form className='login-form'>
          <input type='text' name='' id='#name' placeholder='username' />
          <input type='password' name='' id='#pswd' placeholder='password' />
          <button>Login</button>
          <p className='message'>Not Registered? <a href='#message'>Create an Account</a></p>
        </form>
        <button className='login-with-google-btn' onClick={loginwithgoogle}>Sign in with Google</button>
      </div>
    </div>
  )
}

export default Login;
