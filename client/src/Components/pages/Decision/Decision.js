import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import './Decision.css';

const Decision = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [formData, setFormData] = useState({
    decision_name: '',
    decision_due_date: '',
    decision_taken_date: '',
    user_statement: '',
    user_id: '', 
    decision_reason: [''], // Initial state with one empty reason
  });
  const [errors, setErrors] = useState({}); // State to track errors

  const dropdownHeight = 200;
  const dropdownwidth = 550;
  const navigate = useNavigate();
  const { id } = useParams();

  
  useEffect(() => {
    if (id) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/details/${id}`)
        .then((resp) => {
          const { decision_name, decision_due_date, decision_taken_date, user_statement, user_id, tags, decision_reason_text } = resp.data.decisions[0];
          console.log(resp.data.decisions[0]);

          const formattedDecisionDueDate = decision_due_date ? new Date(decision_due_date).toISOString().split('T')[0] : '';
          const formattedDecisionTakenDate = decision_taken_date ? new Date(decision_taken_date).toISOString().split('T')[0] : '';

        // console.log(Array.isArray(tags),'yyyyy')
          setFormData(prevState => ({
            ...prevState,
            decision_name: decision_name,
            decision_due_date: formattedDecisionDueDate,
            decision_taken_date: formattedDecisionTakenDate,
            user_id: user_id,
            user_statement: user_statement,
            tags: tags,
            decision_reason: decision_reason_text.map(reasonObj => reasonObj.decision_reason_text),
          }));
          setSelectedTags( resp.data.decisions[0].tags);
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            toast.error("Decision not found");
          } else {
            console.error(error);
            // toast.error("An error occurred while fetching decision details");
          }
        });
    }
  }, [id]);
  // console.log(formData,'avavav')

  const tags = [
    "Personal", "Career", "Work", "Family", "Money", "Health", "Spiritual",
    "Long Term", "Short Term", "Routine", "Safety", "Gone Bad", "Regretting",
    "Best", "Good", "Hobby", "Travel", "Hasty", "Time Sensitive",
    "Financial Loss", "Financial Gain"
  ];

  const filteredTags = tags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let formattedValue = value; 
  
    if (id === 'decision_due_date' || id === 'decision_taken_date') {
      const isValidDate = /\d{4}-\d{2}-\d{2}/.test(value);
      if (!isValidDate) {
        return;
      }
  
      formattedValue = value; 
    }
  
    setFormData((prevData) => ({
      ...prevData,
      [id]: formattedValue,
    }));
  };
  
  

  const handleTagSelection = (tag) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
  };

  const handleReasonChange = (index, value) => {
    setFormData(prevState => {
      const updatedReasons = [...prevState.decision_reason];
      updatedReasons[index] = value;
      return {
        ...prevState,
        decision_reason: updatedReasons
      };
    });
  };

  const handleAddReason = () => {
    setFormData(prevState => ({
      ...prevState,
      decision_reason: [...prevState.decision_reason, '']
    }));
  };

  const removeReason = (indexToRemove) =>{
    const updatedReasons = [...formData.decision_reason];
    updatedReasons.splice(indexToRemove,1);
    setFormData({
      ...formData,
      decision_reason:updatedReasons,
    });
  }
  // console.log(selectedTags,'weeee');

  
  const validateForm = () => {
    const errors = {};

    // Validate each field
    if (!formData.decision_name.trim()) {
      errors.decision_name = 'Decision name is required';
    }
    if (!formData.decision_due_date.trim()) {
      errors.decision_due_date = 'Due date is required';
    }
    if (!formData.user_statement.trim()) {
      errors.user_statement = 'Enter the details About the decision';
    }
    if (selectedTags.length === 0) {
      errors.selectedTags = 'Select at least one tag';
    }
    if (formData.decision_reason.some(reason => !reason.trim())) {
      errors.decision_reason = 'At least one reason must be filled';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };
  const handleSubmit = async (e) => {
        e.preventDefault();
        const { decision_name, decision_taken_date,  decision_due_date, user_statement,decision_reason } = formData;
        console.log(formData,"THis is form data")
        console.log(decision_reason)
        if (!validateForm()){
          return;
        }
    const data = {
            decision_name,
            // creation_date,
            decision_due_date,
            decision_taken_date,
            user_statement,
            user_id: '', 
            tags: selectedTags.join(','),
            decision_reason_text: decision_reason.map(reason => ({ decision_reason_text: reason })),
          };
      
          try {
            if (!id) {
              setFormData({
                decision_name,
                // creation_date,
                decision_due_date,
                decision_taken_date,
                user_statement,
                user_id: '',
                tags: selectedTags.join(','),
                decision_reason_text: formData.decision_reason, // Keep it as an array of strings
              })
              console.log("Data for POST request:", data); 
              await axios.post(`${process.env.REACT_APP_API_URL}/api/details`, data);
              toast.success("Decision added successfully");
            } else {
              console.log("Data for PUT request:", data); 
              await axios.put(`${process.env.REACT_APP_API_URL}/api/details/${id}`, data);
              toast.success("Decision updated successfully");
            }
            navigate('/readd');
          } catch (error) {
            console.error("Error:", error.message);
            toast.error("An error occurred while saving the decision");
          }
          console.log("Selected Tags:", selectedTags);
        };
        return (
        <div>
          <h4 className='header'>Details</h4>
              <div className='form'>
                <form onSubmit={handleSubmit}>
                  <div>
                   <div className='form-group'>
                     <label htmlFor='decision_name'>Decision Name:</label>
                     <input
                        type='text'
                        id='decision_name'
                        value={formData.decision_name}
                        onChange={handleInputChange}
                        placeholder='Enter the decision name'
                      />
                    {errors.decision_name && <span className="error">{errors.decision_name}</span>}
                    </div>
                    <div className='form-group'>
                      <label htmlFor='decision_due_date'>Decision Due Date:</label>
                      {/* {formData.decision_due_date} */}
                      <input
                        type='date'
                        id='decision_due_date'
                        value={formData.decision_due_date}
                        onChange={handleInputChange}
                        placeholder='yyyy-mm-dd'
                      />
                    {errors.decision_due_date && <span className="error">{errors.decision_due_date}</span>}
                    </div>
                    <div className='form-group'>
                      <label htmlFor='decision_taken_date'>Decision Taken Date:</label>
                      <input
                        type='date'
                        id='decision_taken_date'
                        value={formData.decision_taken_date}
                        onChange={handleInputChange}
                        placeholder='yyyy-mm-dd'
                      />
                    {errors.decision_taken_date && <span className="error">{errors.decision_taken_date}</span>}
                    </div>
                    <div className='form-group'>
                      <label htmlFor='user_statement'>Decision Details:</label>
                      <input
                        type='text'
                        id='user_statement'
                        value={formData.user_statement}
                        onChange={handleInputChange}
                        placeholder='Enter the statement'
                      />
                      {errors.user_statement && <span className="error">{errors.user_statement}</span>}
                    </div>
                    <div className='form-group'>
                      <label>Decision Reasons:</label>
                      {formData.decision_reason && formData.decision_reason.map((reason, index) => (
                        <div key={index}>
                          <input
                            type='text'
                            value={reason}
                            onChange={e => handleReasonChange(index, e.target.value)}
                            placeholder='Enter the decision reason'
                          />
                          <button className='btnn1' type='button' onClick={() =>removeReason(index)}>Remove</button>
                          {errors.decision_reason && <span className="error">{errors.decision_reason}</span>}
                        </div>
                      ))}
                      <button className='btnn'type='button' onClick={handleAddReason}>Add</button>
                      
                    </div>
                    <div className='form-group'>
                      <label>Select Tags:</label>
                      <input
                        type="text"
                        placeholder="Search tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginBottom: '5px' }}
                        
                      />
                   {errors.selectedTags && <span className="error">{errors.selectedTags}</span>}
                      <div
                        className='tag-container'
                        style={{
                          maxHeight: dropdownHeight,
                          maxWidth:dropdownwidth,
                          overflowY: 'auto',
                          border: '1px solid #ccc',
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems:'center',
                          justifyContent: 'center',
                          marginBottom: '10px',
                          // width:'40vw',
                          margin:'auto',
                          // background:'blue'
                        }}
                      >
                        {filteredTags.map((tag, index) => (
                          <div key={index} className='tag-item'>
                          <label className='tag-label' htmlFor={tag}>{tag}
                            <input
                              type="checkbox"
                              id={tag}
                              checked={selectedTags.includes(tag)}
                              onChange={() => handleTagSelection(tag)}
                            />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                  </div>
                  <input type='submit' value={id ? "Update" : "Save"} />
                </form>
                {/* <Link to='/readd'>
                  <button>Go</button>
                </Link> */}
              </div>
              <ToastContainer/>
            </div>
        )
      };
      export default Decision;

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import './Decision.css';

// const Decision = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [formData, setFormData] = useState({
//     decision_name: '',
//     decision_due_date: '',
//     decision_taken_date: '',
//     user_statement: '',
//     user_id: '', 
//     decision_reason: [''], // Initial state with one empty reason
//   });
//   const [errors, setErrors] = useState({}); // State to track errors

//   const dropdownHeight = 200;
//   const dropdownwidth = 550;
//   const navigate = useNavigate();
//   const { id } = useParams();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const config = {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         };
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/details/${id}`, config);
//         const { decision_name, decision_due_date, decision_taken_date, user_statement, tags, decision_reason_text } = response.data.decisions[0];
//         const formattedDecisionDueDate = decision_due_date ? new Date(decision_due_date).toISOString().split('T')[0] : '';
//         const formattedDecisionTakenDate = decision_taken_date ? new Date(decision_taken_date).toISOString().split('T')[0] : '';
//         setFormData({
//           ...formData,
//           decision_name,
//           decision_due_date: formattedDecisionDueDate,
//           decision_taken_date: formattedDecisionTakenDate,
//           user_statement,
//           tags,
//           decision_reason: decision_reason_text.map(reasonObj => reasonObj.decision_reason_text),
//         });
//         setSelectedTags(response.data.decisions[0].tags);
//       } catch (error) {
//         if (error.response && error.response.status === 404) {
//           toast.error("Decision not found");
//         } else {
//           console.error(error);
//           toast.error("An error occurred while fetching decision details");
//         }
//       }
//     };

//     if (id) {
//       fetchData();
//     }
//   }, [id, formData]);

//   const tags = [
//     "Personal", "Career", "Work", "Family", "Money", "Health", "Spiritual",
//     "Long Term", "Short Term", "Routine", "Safety", "Gone Bad", "Regretting",
//     "Best", "Good", "Hobby", "Travel", "Hasty", "Time Sensitive",
//     "Financial Loss", "Financial Gain"
//   ];

//   const filteredTags = tags.filter(tag =>
//     tag.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleInputChange = (e) => {
//     const { id, value } = e.target;
//     let formattedValue = value; // Initialize with the value as is
  
//     if (id === 'decision_due_date' || id === 'decision_taken_date') {
//       const date = new Date(value);
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
  
//       formattedValue = `${year}-${month}-${day}`;
//     }
  
//     setFormData((prevData) => ({
//       ...prevData,
//       [id]: formattedValue,
//     }));
//   };

//   const handleTagSelection = (tag) => {
//     setSelectedTags(prevTags => {
//       if (prevTags.includes(tag)) {
//         return prevTags.filter(t => t !== tag);
//       } else {
//         return [...prevTags, tag];
//       }
//     });
//   };

//   const handleReasonChange = (index, value) => {
//     setFormData(prevState => {
//       const updatedReasons = [...prevState.decision_reason];
//       updatedReasons[index] = value;
//       return {
//         ...prevState,
//         decision_reason: updatedReasons
//       };
//     });
//   };

//   const handleAddReason = () => {
//     setFormData(prevState => ({
//       ...prevState,
//       decision_reason: [...prevState.decision_reason, '']
//     }));
//   };

//   const removeReason = (indexToRemove) =>{
//     const updatedReasons = [...formData.decision_reason];
//     updatedReasons.splice(indexToRemove,1);
//     setFormData({
//       ...formData,
//       decision_reason:updatedReasons,
//     });
//   }
  
//   const validateForm = () => {
//     const errors = {};

//     if (!formData.decision_name.trim()) {
//       errors.decision_name = 'Decision name is required';
//     }
//     if (!formData.decision_due_date.trim()) {
//       errors.decision_due_date = 'Due date is required';
//     }
//     if (!formData.user_statement.trim()) {
//       errors.user_statement = 'Enter the details About the decision';
//     }
//     if (selectedTags.length === 0) {
//       errors.selectedTags = 'Select at least one tag';
//     }
//     if (formData.decision_reason.some(reason => !reason.trim())) {
//       errors.decision_reason = 'At least one reason must be filled';
//     }

//     setErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { decision_name, decision_taken_date,  decision_due_date, user_statement,decision_reason } = formData;

//     if (!validateForm()){
//       return;
//     }
//     const data = {
//       decision_name,
//       decision_due_date,
//       decision_taken_date,
//       user_statement,
//       user_id: '', 
//       tags: selectedTags.join(','),
//       decision_reason_text: decision_reason.map(reason => ({ decision_reason_text: reason })),
//     };
  
//     try {
//       if (!id) {
//         setFormData({
//           decision_name,
//           decision_due_date,
//           decision_taken_date,
//           user_statement,
//           user_id: '',
//           tags: selectedTags.join(','),
//           decision_reason_text: formData.decision_reason,
//         })
//         await axios.post(`${process.env.REACT_APP_API_URL}/api/details`, data);
//         toast.success("Decision added successfully");
//       } else {
//         await axios.put(`${process.env.REACT_APP_API_URL}/api/details/${id}`, data);
//         toast.success("Decision updated successfully");
//       }
//       navigate('/readd');
//     } catch (error) {
//       console.error("Error:", error.message);
//       toast.error("An error occurred while saving the decision");
//     }
//   };

//   return (
//     <div>
//       <h4 className='header'>Details</h4>
//       <div className='form'>
//         <form onSubmit={handleSubmit}>
//           <div>
//             <div className='form-group'>
//               <label htmlFor='decision_name'>Decision Name:</label>
//               <input
//                 type='text'
//                 id='decision_name'
//                 value={formData.decision_name}
//                 onChange={handleInputChange}
//                 placeholder='Enter the decision name'
//               />
//               {errors.decision_name && <span className="error">{errors.decision_name}</span>}
//             </div>
//             <div className='form-group'>
//               <label htmlFor='decision_due_date'>Decision Due Date:</label>
//               <input
//                 type='date'
//                 id='decision_due_date'
//                 value={formData.decision_due_date}
//                 onChange={handleInputChange}
//               />
//               {errors.decision_due_date && <span className="error">{errors.decision_due_date}</span>}
//             </div>
//             <div className='form-group'>
//               <label htmlFor='decision_taken_date'>Decision Taken Date:</label>
//               <input
//                 type='date'
//                 id='decision_taken_date'
//                 value={formData.decision_taken_date}
//                 onChange={handleInputChange}
//               />
//               {errors.decision_taken_date && <span className="error">{errors.decision_taken_date}</span>}
//             </div>
//             <div className='form-group'>
//               <label htmlFor='user_statement'>Decision Details:</label>
//               <input
//                 type='text'
//                 id='user_statement'
//                 value={formData.user_statement}
//                 onChange={handleInputChange}
//                 placeholder='Enter the statement'
//               />
//               {errors.user_statement && <span className="error">{errors.user_statement}</span>}
//             </div>
//             <div className='form-group'>
//               <label>Decision Reasons:</label>
//               {formData.decision_reason && formData.decision_reason.map((reason, index) => (
//                 <div key={index}>
//                   <input
//                     type='text'
//                     value={reason}
//                     onChange={e => handleReasonChange(index, e.target.value)}
//                     placeholder='Enter the decision reason'
//                   />
//                   <button className='btnn1' type='button' onClick={() =>removeReason(index)}>Remove</button>
//                   {errors.decision_reason && <span className="error">{errors.decision_reason}</span>}
//                 </div>
//               ))}
//               <button className='btnn' type='button' onClick={handleAddReason}>Add</button>
//             </div>
//             <div className='form-group'>
//               <label>Select Tags:</label>
//               <input
//                 type="text"
//                 placeholder="Search tags..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 style={{ marginBottom: '5px' }}
//               />
//               {errors.selectedTags && <span className="error">{errors.selectedTags}</span>}
//               <div
//                 className='tag-container'
//                 style={{
//                   maxHeight: dropdownHeight,
//                   maxWidth: dropdownwidth,
//                   overflowY: 'auto',
//                   border: '1px solid #ccc',
//                   borderRadius: '5px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   marginBottom: '10px',
//                   margin: 'auto',
//                 }}
//               >
//                 {filteredTags.map((tag, index) => (
//                   <div key={index} className='tag-item'>
//                     <label className='tag-label' htmlFor={tag}>{tag}
//                       <input
//                         type="checkbox"
//                         id={tag}
//                         checked={selectedTags.includes(tag)}
//                         onChange={() => handleTagSelection(tag)}
//                       />
//                     </label>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//           <input type='submit' value={id ? "Update" : "Save"} />
//         </form>
//       </div>
//       <ToastContainer/>
//     </div>
//   );
// };

// export default Decision;
