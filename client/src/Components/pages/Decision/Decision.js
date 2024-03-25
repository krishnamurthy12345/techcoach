import React, { useEffect, useState } from 'react';
import { useParams, useNavigate ,Link} from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Decision.css';

const Decision = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [formData, setFormData] = useState({
    decisionName: '',
    decisionReason: '', // Initialize as an array with one empty string
    created_by: '',
    user_Creation: '',
    user_Statement: ''
  });

  const dropdownHeight = 200;
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const dummyFormData = {
      decisionName: '',
      decisionReason: '',
      created_by: '',
      user_Creation: '',
      user_Statement: ''
    };

    if (id) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/details/${id}`)
        .then((resp) => {
          setFormData({
            ...resp.data,
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
    } else {
      setFormData(dummyFormData);
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
    setFormData({
      ...formData,
      [id]: value || ''
    });
  };

  const handleSubmit = async (e) => {
    console.log('ccc')
    e.preventDefault();
    const { decisionName, decisionReason, created_by, user_Creation, user_Statement } = formData;
    if (!decisionName || !decisionReason || !created_by || !user_Creation || !user_Statement) {
      toast.error("Please provide a value for each input field");
    } else {
      const currentTime = new Date();

      if (!isNaN(currentTime.getTime())) {
        const isoTime = currentTime.toISOString();
        const data = {
          decisionName,
          decisionReason,
          created_by,
          user_Creation,
          user_Statement,
          tags: selectedTags.join(','),
          updated_at: isoTime
        };

        try {
          if (!id) {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/details`, data);
            setFormData({
              decisionName: '',
              decisionReason: '',
              created_by: '',
              user_Creation: '',
              user_Statement: ''
            });
            const responseData = response.data;
            setSelectedTags(responseData.tags ? responseData.tags.split(',') : []);
            toast.success("Decision added successfully");
            navigate('/readd');
          } else {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/details/${id}`, data);
            const responseData = response.data;
            setSelectedTags(responseData.tags ? responseData.tags.split(',') : []);
            toast.success("Decision updated successfully");
            navigate('/readd');
          }
        } catch (error) {
          console.error("Error:", error.message);
          toast.error("An error occurred while saving the decision");
          console.error(error);
        }
      }
    }
  };

  return (
    <div>
      <h4>Details</h4>
      <div className='col-lg-8 col-md-6'>
        <form onSubmit={handleSubmit}>
          <div>
            <div>
              <label htmlFor='decisionName'>Decision Name:</label>
              <input type='text' id='decisionName' value={formData.decisionName} onChange={handleInputChange} />
            </div>
            <div>
              <label htmlFor='decisionReason'>Decision Reason:</label>
              <input type='text' id='decisionReason' value={formData.decisionReason} onChange={handleInputChange} />
            </div>
            <div>
              <label htmlFor='created_by'>Created By:</label>
              <input type='text' id='created_by' value={formData.created_by} onChange={handleInputChange} />
            </div>
            <div>
              <label htmlFor='user_Creation'>User Creation:</label>
              <input type='text' id='user_Creation' value={formData.user_Creation} onChange={handleInputChange} />
            </div>
            <div>
              <label htmlFor='user_Statement'>User Statement:</label>
              <input type='text' id='user_Statement' value={formData.user_Statement} onChange={handleInputChange} />
            </div>
          </div>
          <div className='col-lg-4 col-md-6'>
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
                marginTop: '5px',
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
