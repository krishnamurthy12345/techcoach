import React from 'react';
import { useLocation } from 'react-router-dom';
import Nav from '../Components/DashBoard/Nav/Nav';

const DashboardRedirect = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  if (token) {
    localStorage.setItem('token', token); 
  }

  return <Nav />;
};

export default DashboardRedirect;
