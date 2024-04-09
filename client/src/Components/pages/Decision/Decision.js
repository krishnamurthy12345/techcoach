import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
// import './Decision.css';


const Decision = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [formData, setFormData] = useState({
    decision_name: '',
    decision_reason: [''],
    // created_by: '',
    creation_date: '',
    decision_due_date: '',
    decision_taken_date: '',
    user_statement: '',
    user_id:''
  });

  console.log(formData);

  const dropdownHeight = 200;
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!id) {
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      setFormData(prevState => ({
        ...prevState,
        creation_date: currentDate,
        }));
    } else {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/details/${id}`)
        .then((resp) => {
          setFormData({
            ...resp.data,
            decision_reason: resp.data.reasons || [''],
            
          });
          setSelectedTags(resp.data.tags ? resp.data.tags.split(',') : []);
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            toast.error("Decision not found");
          } else {
            console.error(error);
            toast.error("An error occurred while fetching decision details");
          }
        });
    }
  }, [id]);




  const tags = [
    "Personal", "Career", "Work", "Family", "Money", "Health", "Spiritual",
    "Long Term", "Short Term", "Routine", "Safety", "Gone Bad", "Regretting",
    "Best", "Good", "Hobby", "Travel", "Hasty", "Time Sensitive",
    "Financial Loss", "Financial Gain"
  ];

  const filteredTags = tags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTagSelection = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(formData => ({
      ...formData,
      [id]: value 
    }));
  };

  const handleAddReason = () => {
    setFormData(prevState => ({
      ...prevState,
      decision_reason: [...prevState.decision_reason, '']
    }));
  };

  const handleReasonChange = (index, value) => {
    const updatedReason = [...formData.decision_reason];
    updatedReason[index] = value;
    setFormData({
      ...formData,
      decision_reason: updatedReason
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { decision_name, decision_reason,created_by,  creation_date, decision_due_date, decision_taken_date, user_statement,user_id } = formData;
  
    if (!decision_name || decision_reason.some(reason => reason.trim() === '') || !creation_date || !decision_due_date || !decision_taken_date || !user_statement ) {
      toast.error("Please provide a value for each input field");
    } else {
      const data = {
        decision_name,
        decision_reason,
        // created_by, 
        creation_date,
        decision_due_date,
        decision_taken_date,
        user_statement,
        tags: selectedTags.join(','),
        decision_reason_text: decision_reason.map(reason => ({ decision_reason_text: reason })),
        user_id, 
      };
  
      try {
        if (!id) {
          setFormData({
            decision_name,
            decision_reason,
            // created_by,
            creation_date,
            decision_due_date,
            decision_taken_date,
            user_statement,
            tags: selectedTags.join(','),
            decision_reason_text: decision_reason.map(reason => ({ decision_reason_text: reason })),
            user_id,
          });
          console.log("Data for POST request:", data); // Log data before POST request
          await axios.post(`${process.env.REACT_APP_API_URL}/api/details`, data);
          toast.success("Decision added successfully");
        } else {
          console.log("Data for PUT request:", data); // Log data before PUT request
          await axios.put(`${process.env.REACT_APP_API_URL}/api/details/${id}`, data);
          toast.success("Decision updated successfully");
        }
        navigate('/readd');
      } catch (error) {
        console.error("Error:", error.message);
        toast.error("An error occurred while saving the decision");
        console.error(error);
      }
    }
  };
  


  return (
    <div>
      <h4 className='heading'>Details</h4>
      <div className='form'>
        <form onSubmit={handleSubmit}>
          <div>
            <div>
              <label htmlFor='decision_name'>Decision Name:</label>
              <input type='text' id='decision_name' value={formData.decision_name} onChange={handleInputChange} placeholder='enter the decision name' />
            </div>

             {/* <div>
              <label htmlFor='created_by'>Created By:</label>
              <input type='text' id='created_by' value={formData.created_by} onChange={handleInputChange} placeholder='enter the creater...'/>
            </div>  */}
            <div>
              <label htmlFor='creation_date'>Creation Date:</label>
              <input type='datetime-local' id='creation_date' value={formData.creation_date} onChange={handleInputChange} placeholder='yyyy-mm-dd'/>
            </div>
            <div>
              <label htmlFor='decision_due_date'>Decision Due Date:</label>
              <input type='datetime' id='decision_due_date' value={formData.decision_due_date} onChange={handleInputChange} placeholder='yyyy-mm-dd'/>
            </div>
            <div>
              <label htmlFor='decision_taken_date'>Decision Taken Date:</label>
              <input type='datetime' id='decision_taken_date' value={formData.decision_taken_date} onChange={handleInputChange} placeholder='yyyy-mm-dd'/>
            </div>
            <div>
              <label htmlFor='user_statement'>User Statement:</label>
              <input type='text' id='user_statement' value={formData.user_statement} onChange={handleInputChange} placeholder='enter the statement'/>
            </div>
            {/* <div>
              <label htmlFor='user_id'>User Id:</label>
              <input type='text' id='user_id' value={formData.user_id} onChange={handleInputChange} placeholder='enter the user_id'/>
            </div> */}
            {/* hhh */}
          </div>
          <div className=''>
            <label>Select Tags:</label>
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: '5px' }}
            />
            <div
              style={{
                maxHeight: dropdownHeight,
                overflowY: 'auto',
                border: '1px solid #ccc',
                borderRadius: '5px',
                // marginTop: '5px',
              }}
            >
              {filteredTags.map((tag, index) => (
                <div key={index}>
                  <input
                    type="checkbox"
                    id={tag}
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagSelection(tag)}
                  />
                  <label htmlFor={tag}>{tag}</label>
                </div>
              ))}
            </div>
            <div className=''>
              <label>Decision Reasons:</label>
              {formData.decision_reason && formData.decision_reason.map((reason, index) => (
                <div key={index}>
                  <input type='text' value={reason} onChange={e => handleReasonChange(index, e.target.value)} placeholder='enter the decision name'/>
                </div>
              ))}
              <button className="btn" onClick={handleAddReason}>Add </button>
            </div>
          </div>
          <input type='submit' value={id ? "Update" : "Save"} />
        </form>
        <Link to='/readd'>
          <button>Go</button>
        </Link>
      </div>
    </div>
  );
};

export default Decision;

