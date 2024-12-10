import React from 'react';
import { useLocation } from 'react-router-dom';
import Nav from '../Components/DashBoard/Nav/Nav';

const DashboardRedirect = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const userId = queryParams.get('user_id'); 

  if (token) {
    localStorage.setItem('token', token); 
  }

  if(userId) {
    localStorage.setItem('user_id',userId);
  }

  return <Nav />;
};

export default DashboardRedirect;
