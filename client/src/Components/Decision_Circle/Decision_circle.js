import React, { useState } from 'react';
import './Decision_circle.css';
import withAuth from '../withAuth';
import { IoClose } from "react-icons/io5";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { postdecisionGroup, putDecisionGroup } from './Networkk_Call';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Decision_circle = () => {
  const [circleCreated, setCircleCreated] = useState(false);
  const [circleName, setCircleName] = useState('');
  const navigate = useNavigate();
  const {id} = useParams();

  const handleCreateCircle = () => {
    setCircleCreated(true);
    setCircleName('');
  };

  const handleCloseCircle = () => {
    setCircleCreated(false);
  };

  const handleSaveCircle = async () => {
    try {
      if (id) {
        const updatedData = ( circleName);
        const result = await putDecisionGroup(id,updatedData);
        toast.success('Decision group updated successfully');
        console.log('Decision group updated successfully:', result);
      } else {
        const result = await postdecisionGroup(circleName);
        alert('Decision group created successfully')
        console.log('Decision group created successfully:', result);
      }

      handleCloseCircle();
      navigate('/getdecisioncircle');
    } catch (error) {
      console.error('Failed to create/update decision group:', error);
      toast.error('Failed to Create/Update')
    }
  };

  const handleCircleNameChange = (event) => {
    setCircleName(event.target.value);
  };

  return (
    <>
      <div className={`main-container ${circleCreated ? 'blur-background' : ''}`}>
        <center>
          <div className='circle mt-4'>
            <h4>Decision Circle</h4>
            <p>Decision Circle Creation Details</p>
            <div>
              <button
                className='btn-secondary me'
                onClick={handleCreateCircle}
              >
                Create circle Names          
              </button>
            </div>
          </div>
          <Link to='/getdecisioncircle'>
            <button className='creategroup'>
              Get Circle Names
            </button>
          </Link>
        </center>
      </div>

      {circleCreated && (
        <div className='circles'>
          <div className='created-circle-card'>
            <IoClose onClick={handleCloseCircle} className='close-icon' />
            <div>
              <p>Enter Circle Name :</p>
              <input
                type='text'
                placeholder='Enter Circle Name'
                value={circleName}
                onChange={handleCircleNameChange}
              />
              <button className='bg-info rounded ml-2' onClick={handleSaveCircle}>
                {id ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default withAuth(Decision_circle);
