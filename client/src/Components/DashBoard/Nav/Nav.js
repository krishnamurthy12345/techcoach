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


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './Nav.css';

// const Nav = () => {
//   const [data, setData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage,setCurrentPage] = useState(1);
//   const recordsPerPage = 5;
  
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

  
//   const totalPages = Math.ceil(filteredData.length / recordsPerPage);
//   const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

//   const indexOfLastRecord = currentPage * recordsPerPage;
//   const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
//   const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

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

//   useEffect(() => {
//     const indexOfLastRecord = currentPage * recordsPerPage;
//     const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
//     const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
//   }, [currentPage, data, recordsPerPage]);

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
//           {currentRecords.map((decision, index) => (
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
//       <nav className='page'>
//         <ul className='pagination'>
//           <li className='page-item'>
//             <button href='#' className='page-link' onClick={handlePrevPage}>Prev</button>
//           </li>
//           {pageNumbers.map((pageNumber) => (
//             <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
//               <button href='#' className='page-link' onClick={() => handlePageChange(pageNumber)}>
//                 {pageNumber}
//               </button>
//             </li>
//           ))}
//           <li className='page-item'>
//             <button href='#' className='page-link' onClick={handleNextPage}>Next</button>
//           </li>
//         </ul>
//       </nav>
//     </div>
//   );

// };

// export default Nav;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Pagination } from 'react-bootstrap';
import './Nav.css';

const Nav = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

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
      (decision.decision_name && decision.decision_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (decision.tagsArray && decision.tagsArray.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  });

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, filteredData.length);

  // console.log("shhshhshsh", filteredData)
  return (
    <div>
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
          {filteredData.slice(startIndex, endIndex).map((decision, index) => (
            <tr key={decision.decision_id}>
              <th scope='row'>{startIndex + index + 1}</th>
              <td>{decision.decision_name}</td>
              <td>{new Date(decision.decision_due_date).toLocaleDateString()}</td>
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
      <div className='pagination-container'>
        <Pagination>
          <Pagination.Prev onClick={handlePrevPage} />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item key={i + 1} active={currentPage === i + 1} onClick={() => handlePageChange(i + 1)}>
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={handleNextPage} />
        </Pagination>
      </div>
    </div>
  );
};

export default Nav;
