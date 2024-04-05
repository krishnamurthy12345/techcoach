import React, { useEffect } from 'react';
import Nav from '../DashBoard/Nav/Nav';

function Dashboard() {
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const id = urlParams.get('user_id')
      console.log(token);
      console.log(id);

      if (token && id) {
        localStorage.setItem('token', token); 
        localStorage.setItem('user_id',id);
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }, []);

  return (
    <div>
      <Nav />
    </div>
  );
}

export default Dashboard;
