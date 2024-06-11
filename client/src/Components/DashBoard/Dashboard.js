import React from 'react';
import Nav from '../DashBoard/Nav/Nav';


function Dashboard() {
  // useEffect(() => {
  //   try {
  //     const urlParams = new URLSearchParams(window.location.search);
  //     const token = urlParams.get('token');
  //     console.log('1',token);

  //     if (token) {
  //       localStorage.setItem('token', token); 
  //     }
  //   } catch (error) {
  //     console.error('Error setting auth token:', error);
  //   }
  // }, []);

  return (
    <div>
      <Nav />
    </div>
  );
}

export default Dashboard;
