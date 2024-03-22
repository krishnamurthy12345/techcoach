import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const View = () => {
  const [user, setUser] = useState({});

  const { id } = useParams();
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/profile/:${id}`) 
      .then((resp) => setUser({ ...resp.data.data[0] }));
  }, [id]);

  return (
    <div style={{ marginTop: "150px" }}>
      <div className='card'>
        <div className='card-header'>
          <p>User Profile Detail </p>
        </div>
        <div className='container'>
          <strong>ID:</strong>
          <span>{id}</span>
          <br />
          <br />
          <strong>YearBorn:</strong>
          <span>{user.YearBorn}</span>
          <br />
          <br />
          <strong>Gender:</strong>
          <span>{user.Gender}</span>
          <br />
          <br/>
          <strong>AddedDate:</strong>
          <span>{user.AddedDate}</span>
          <br />
          <br />
          <strong>Type:</strong>
          <span>{user.Type}</span>
          <br />
          <br/>
          <strong>Strength1:</strong>
          <span>{user.Strength1}</span>
          <br />
          <br/>
          <strong>Strength2:</strong>
          <span>{user.Strength2}</span>
          <br />
          <br/>
          <strong>Skill:</strong>
          <span>{user.Skill}</span>
          <br />
          <br/>
          <strong>Attitude:</strong>
          <span>{user.Attitude}</span>
          <br />
          <br/>
          <strong>Communication:</strong>
          <span>{user.Communication}</span>
          <br />
          <br/>
          <strong>Weakness:</strong>
          <span>{user.Weakness}</span>
          <br />
          <br/>
          <strong>Opportunity:</strong>
          <span>{user.Opportunity}</span>
          <br />
          <br/>
          <strong>Threat:</strong>
          <span>{user.Threat}</span>
          <br />
          <br/>
          <Link to='/profile'>
            <div className='btn btn-edit'>Go Back</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default View;
