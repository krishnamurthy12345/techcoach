// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const initialState = {
//     decisionName: '',
//     decisionReason: '',
//     createdBy: '',
//     userCreation: '',
//     userStatement: ''
//   };
  
//   const Edit = () => {
//     const [state, setState] = useState(initialState);
//     const [selectedTags, setSelectedTags] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const { decisionName,decisionReason,createdBy,userCreation,userStatement} = state;
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState({})
//     const dropdownHeight = 100;

  
//     const tags = [
//         "Personal", "Career", "Work", "Family", "Money", "Health", "Spiritual",
//         "Long Term", "Short Term", "Routine", "Safety", "Gone Bad", "Regretting",
//         "Best", "Good", "Hobby", "Travel", "Hasty", "Time Sensitive",
//         "Financial Loss", "Financial Gain"
//       ];

//     const { id } = useParams();
//     useEffect(() => {
//       if (id) {
//         axios
//           .get(`http://localhost:6005/api/all-decisions/${id}`)
//           .then((resp) => setState(resp.data[0]))
//           .catch((error) => console.error(error));
//       }
//     }, [id]);

//     const handleTagSelection = (tag) => {
//         if (selectedTags.includes(tag)) {
//           setSelectedTags(selectedTags.filter(t => t !== tag));
//         } else {
//           setSelectedTags([...selectedTags, tag]);
//         }
//       };


//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (!decisionName || !decisionReason || !createdBy || !userCreation || !userStatement) {
//           toast.error("Please provide a value for each input field");
//         } else {
//           const data = {decisionName,decisionReason,createdBy,userCreation,userStatement  };
//           if (!id) {
//             axios
//               .post("http://localhost:6005/api/details", data)
//               .then(() => {
//                 setState(initialState);
//                 toast.success("Decision added successfully");
//                 navigate('/decision');
//               })
//               .catch((err) => toast.error(err.response.data));
//           } else {
//             axios
//               .put(`http://localhost:6005/api/details/${id}`, data)
//               .then(() => {
//                 setState(initialState);
//                 toast.success("Contact updated successfully");
//                 navigate('/readd');
//               })
//               .catch((err) => toast.error(err.response.data));
//           }
//         }
//       };
    
     
//       const handleInputChange = (e) => {
//         const { id, value } = e.target;
//         setFormData({
//           ...formData,
//           [id]: value
//         });
//       };
    
    
//       const filteredTags = tags.filter(tag =>
//         tag.toLowerCase().includes(searchTerm.toLowerCase())
//       );

      
//     const handleChange = (e) => {
//       const { id, value } = e.target;
//       setState((prev) => ({ ...prev, [id]: value }));
//     };
//     return (
//         <div className='col-lg-8 col-md-6'>
//         <form onSubmit={handleSubmit}>
//           <div>
//             <div>
//               <label htmlFor='decisionName'>Decision Name:</label>
//               <input type='text' id='decisionName' value={decisionName} onChange={handleInputChange}/>
//             </div>
//             <div>
//               <label htmlFor='decisionReason'>Decision Reason:</label>
//               <input type='text' id='decisionReason' value={decisionReason} onChange={handleInputChange}/>
//             </div>
//             <div>
//               <label htmlFor='createdBy'>Created By:</label>
//               <input type='text' id='createdBy' value={createdBy} onChange={handleInputChange}/>
//             </div>
//             <div>
//               <label htmlFor='userCreation'>User Creation:</label>
//               <input type='text' id='userCreation' value={userCreation} onChange={handleInputChange}/>
//             </div>
//             <div>
//               <label htmlFor='userStatement'>User Statement:</label>
//               <input type='text' id='userStatement' value={userStatement} onChange={handleInputChange}/>
//             </div>
//           </div>
//           <div className='col-lg-4 col-md-6'>
//             <label>Select Tags:</label>
//             <input
//               type="text"
//               placeholder="Search tags..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               style={{ marginBottom: '5px' }}
//             />
//             <div
//               style={{
//                 maxHeight: dropdownHeight,
//                 overflowY: 'auto',
//                 border: '1px solid #ccc',
//                 borderRadius: '5px',
//                 marginTop: '5px',
//               }}
//             >
//               {filteredTags.map((tag, index) => (
//                 <div key={index}>
//                   <input
//                     type="checkbox"
//                     id={tag}
//                     checked={selectedTags.includes(tag)}
//                     onChange={() => handleTagSelection(tag)}
//                   />
//                   <label htmlFor={tag}>{tag}</label>
//                 </div>
//               ))}
//             </div>
//           </div>
        
//           <input type='submit' value={id ? "Update" : "Save"} />
//         <Link to='/decision'>
//           <input type='button' value='Go Back' />
//         </Link>
    
//         </form>
//       </div>
//     )
//               }
// export default Edit;