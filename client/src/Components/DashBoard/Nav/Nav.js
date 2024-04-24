import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Nav = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        // console.log('wewewe',token)
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const responseData = response.data;
        // console.log("getdata:",response);
        console.log("Response Data:", responseData);
        if (Array.isArray(responseData.decisionData)) {
          setData(responseData.decisionData);
        } else {
          console.error("Invalid response format:", responseData);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);

      }
    };

    loadData();
  }, []);


  const filteredData = data.filter(decision => {
    return (
      (decision.decision_name && decision.decision_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (decision.tagsArray && decision.tagsArray.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  });

  console.log('Filtered Data:', filteredData);

  return (
    <div>
      {/* {error && <p>{error}</p>}  */}
      <table className='styled-table'>
        <thead>
          <tr>
            <th>#</th>
            <th>Decision Name</th>
            <th>Decision Due Date</th>
            <th>Decision Taken Date</th>
            <th>User Statement</th>
            <th>Tags</th>
            <th>Decision Reasons</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((decision, index) => (
            <tr key={decision.decision_id}>
              <th scope='row'>{index + 1}</th>
              <td>{decision.decision_name}</td>
              <td>{decision.decision_due_date}</td>
              <td>{decision.decision_taken_date}</td>
              <td>{decision.user_statement}</td>
              <td>
                {decision.tagsArray && decision.tagsArray.join(', ')}
              </td>
              <td>
                {decision.decision_reason_text && decision.decision_reason_text.map(reason => (
                  <div key={reason}>{reason}</div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Nav;
