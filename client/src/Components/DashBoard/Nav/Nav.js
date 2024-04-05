import React, { useState } from 'react';
import './Nav.css';
import { Link } from 'react-router-dom';
import { BsFillBellFill, BsFillEnvelopeFill, BsPersonCircle } from 'react-icons/bs';

function Dashboard() {
  const [navCollapse, setNavCollapse] = useState(false);

  // Function to handle navigation when an option is selected
  const handleProfileSelect = (event) => {
    const selectedOption = event.target.value;
    if (selectedOption === 'basic') {
      // Navigate to the Basic Information route
      window.location.href = '/basic';
    } else if (selectedOption === 'personal') {
      // Navigate to the Personal Info route
      window.location.href = '/personal';
    }
  };

  return (
    <div>
      <nav className='nav'>
        <div className='logo'>
          <i className='bi bi-justify largeDeviceIcon' onClick={() => setNavCollapse(!navCollapse)}></i>
        </div>
        <ul>
          <li><Link to='/decision'><BsFillEnvelopeFill className='icon' /> Decision</Link></li>
          <li><Link to='/notification'><BsFillBellFill className='icon' /> Notification</Link></li>
          <li>
            <BsPersonCircle className='icon' />
            Profile
            <select onChange={handleProfileSelect}>
              <option value=""></option>
              <option value="basic">Basic Information</option>
              <option value="personal">Personal info</option>
            </select>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Dashboard;
