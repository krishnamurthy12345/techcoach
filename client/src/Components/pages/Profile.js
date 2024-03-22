import React, { useState, useEffect } from 'react';
import './Profile.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Profile() {
  const [profileData, setProfileData] = useState([]);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/insert_data`);
      if (Array.isArray(response.data.data)) {
        setProfileData(response.data.data);
      } else {
        console.error("Profile data is not an array:", response.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  useEffect(() => {
    fetchProfileData();
  }, []);



  // const deleteContact = async (id) => {
  //   if (window.confirm("Are you sure that you want to delete that contact?")) {
  //     try {
  //       await axios.delete(`http://localhost:6005/profile/${id}`);
  //       toast.success("Row Deleted Successfully");
  //       setTimeout(() => fetchProfileData(), 500);
  //     } catch (error) {
  //       console.error("Error deleting contact:", error);
  //     }
  //   }
  // };

  return (
    <div>
      <h4>Profile Details</h4>
      <div>
        <Link to='/read'>
          <button className='btn btn-person'>Add PersonDetails</button>
        </Link>
        <center>
          <table className='styled-table'>
            <thead>
              <tr>
                {/* <th>ID</th> */}
                <th>googleId</th>
                <th>displayName</th>
                <th>email</th>
                <th>image</th>
                
              </tr>
            </thead>
            <tbody>
              {profileData.map((item) => (
                <tr key={item.id}>
                  <td>{item.googleId}</td>
                  <td>{item.displayName}</td>
                  <td>{item.email}</td>
                  <td>{item.image}</td>
                  <td>
                    <Link to={`/update/${item.id}`}>
                      <button className='btn btn-edit'>Edit</button>
                    </Link>
                    {/* <button className='btn btn-delete' onClick={() => deleteContact(item.id)}>Delete</button>
                    <Link to={`/view/${item.id}`}>
                      <button className='btn btn-view'>View</button>
                    </Link> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </center>
      </div>
    </div>
  );
}

export default Profile;
