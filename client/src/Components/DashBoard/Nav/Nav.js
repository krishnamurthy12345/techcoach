// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const Nav = () => {
//   const [data, setData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         // console.log('wewewe',token)
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/`, {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });
//         const responseData = response.data;
//         // console.log("getdata:",response);
//         console.log("Response Data:", responseData);
//         if (Array.isArray(responseData.decisionData)) {
//           setData(responseData.decisionData);
//         } else {
//           console.error("Invalid response format:", responseData);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error.message);

//       }
//     };

//     loadData();
//   }, []);


//   const filteredData = data.filter(decision => {
//     return (
//       (decision.decision_name && decision.decision_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (decision.tagsArray && decision.tagsArray.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
//     );
//   });

//   console.log('Filtered Data:', filteredData);

//   return (
//     <div>
//       {/* {error && <p>{error}</p>}  */}
//       <table className='styled-table'>
//         <thead>
//           <tr>
//             <th>#</th>
//             <th>Decision Name</th>
//             <th>Decision Due Date</th>
//             <th>Decision Taken Date</th>
//             <th>User Statement</th>
//             <th>Tags</th>
//             <th>Decision Reasons</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredData.map((decision, index) => (
//             <tr key={decision.decision_id}>
//               <th scope='row'>{index + 1}</th>
//               <td>{decision.decision_name}</td>
//               <td>{decision.decision_due_date}</td>
//               <td>{decision.decision_taken_date}</td>
//               <td>{decision.user_statement}</td>
//               <td>
//                 {decision.tagsArray && decision.tagsArray.join(', ')}
//               </td>
//               <td>
//                 {decision.decision_reason_text && decision.decision_reason_text.map(reason => (
//                   <div key={reason}>{reason}</div>
//                 ))}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Nav;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Nav.css';

const Nav = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const loggedInUserId = // Get the logged-in user ID from the authentication context or local storage

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const responseData = response.data;
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
      decision.user_id === loggedInUserId &&
      ((decision.decision_name && decision.decision_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (decision.tagsArray && decision.tagsArray.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (!decision.decision_taken_date)) // Filter out decisions with a taken date, meaning pending decisions
    );
  });

  // Count live decisions
  const liveDecisionsCount = filteredData.length;

  // Count pending decisions
  const pendingDecisionsCount = data.filter(decision => {
    return (
      decision.user_id === loggedInUserId &&
      !decision.decision_taken_date 
    );
  }).length;

  return (
    <div>
      <div className="row row-cols-1 row-cols-md-2 g-2 homepage">
        <div className="col">
          <div className="card">
            <div className="card-body1">
              <h5 className="card-title">Total Logged Decisions</h5>
              <p className="card-text">{liveDecisionsCount}</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-body2">
              <h5 className="card-title">Pending Decisions</h5>
              <p className="card-text">{pendingDecisionsCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;



// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { Pagination } from 'react-bootstrap';
// import './Nav.css';

// const Nav = () => {
//   const [data, setData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const recordsPerPage = 10;

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/`, {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });
//         const responseData = response.data;
//         if (Array.isArray(responseData.decisionData)) {
//           setData(responseData.decisionData);
//         } else {
//           console.error("Invalid response format:", responseData);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error.message);
//       }
//     };

//     loadData();
//   }, []);

//   const filteredData = data.filter(decision => {
//     return (
//       (decision.decision_name && decision.decision_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (decision.tagsArray && decision.tagsArray.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
//     );
//   });

//   const totalPages = Math.ceil(filteredData.length / recordsPerPage);

//   const handlePrevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const startIndex = (currentPage - 1) * recordsPerPage;
//   const endIndex = Math.min(startIndex + recordsPerPage, filteredData.length);

//   // console.log("shhshhshsh", filteredData)
//   return (
//     <div>
//       <table className='styled-table'>
//         <thead>
//           <tr>
//             <th>#</th>
//             <th>Decision Name</th>
//             <th>Decision Due Date</th>
//             <th>Decision Taken Date</th>
//             <th>User Statement</th>
//             <th>Tags</th>
//             <th>Decision Reasons</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredData.slice(startIndex, endIndex).map((decision, index) => (
//             <tr key={decision.decision_id}>
//               <th scope='row'>{startIndex + index + 1}</th>
//               <td>{decision.decision_name}</td>
//               <td>{new Date(decision.decision_due_date).toLocaleDateString()}</td>
//               <td>{decision.decision_taken_date}</td>
//               <td>{decision.user_statement}</td>
//               <td>
//                 {decision.tagsArray && decision.tagsArray.join(', ')}
//               </td>
//               <td>
//                 {decision.decision_reason_text && decision.decision_reason_text.map(reason => (
//                   <div key={reason}>{reason}</div>
//                 ))}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <div className='pagination-container'>
//         <Pagination>
//           <Pagination.Prev onClick={handlePrevPage} />
//           {Array.from({ length: totalPages }, (_, i) => (
//             <Pagination.Item key={i + 1} active={currentPage === i + 1} onClick={() => handlePageChange(i + 1)}>
//               {i + 1}
//             </Pagination.Item>
//           ))}
//           <Pagination.Next onClick={handleNextPage} />
//         </Pagination>
//       </div>
//     </div>
//   );
// };

// export default Nav;
