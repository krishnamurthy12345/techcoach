import React, { useState } from 'react';
import './Decision_circle.css';
import withAuth from '../withAuth';
import { IoClose } from "react-icons/io5";
import { Link } from 'react-router-dom';

const Decision_circle = () => {
  const [circleCreated, setCircleCreated] = useState(false);

  const handleCreateCircle = () => {
    setCircleCreated(true);
  };

  const handleCloseCircle = () => {
    setCircleCreated(false);
  };

  return (
    <>
      <div className={`main-container ${circleCreated ? 'blur-background' : ''}`}>
        <center>
          <div className='circle mt-4'>
            <h4>Decision Circle</h4>
            <p>Decision Circle Creation Details</p>
            <button
              className='btn-secondary me'
              onClick={handleCreateCircle}
            >
              Create Circle
            </button>
          </div>
        </center>
      </div>

      {circleCreated && (
        <div className='circles'>
          <div className='created-circle-card'>
            <IoClose onClick={handleCloseCircle} className='close-icon' />
            <Link to='/list-name'><button className='rounded bg-secondary text-white'>Decision Circle</button></Link>
          </div>
        </div>
      )}
    </>
  );
};

export default withAuth(Decision_circle);
