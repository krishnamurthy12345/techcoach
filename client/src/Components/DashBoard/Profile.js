import React from 'react';

const Profile = () => {

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
      <div>
        <center>
        <ul>
          <li>
            Profile
            <select onChange={handleProfileSelect}>
              <option value=""></option>
              <option value="basic">Basic Information</option>
              <option value="personal">Personal info</option>
            </select>
          </li>
        </ul>
        </center>
      </div>
    </div>
  )
}

export default Profile