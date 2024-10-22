import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaUserEdit } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import withAuth from '../../withAuth';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Profile.css';


const Profile = () => {
  const [formData, setFormData] = useState({});
  const [userData, setUserData] = useState({});
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userResp = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const user = userResp.data.tasks && userResp.data.tasks.length ? userResp.data.tasks[0] : {};
        console.log('asas', userResp);
        setUserData(user);

        const formResp = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/data`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFormData(formResp.data);
        console.log('Fetched profile data:', formResp.data);

        const decisionsResp = await axios.get(`${process.env.REACT_APP_API_URL}/api/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (Array.isArray(decisionsResp.data.decisionData)) {
          setDecisions(decisionsResp.data.decisionData);
        } else {
          console.error("Invalid response format:", decisionsResp.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderLines = (data) => {
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <div key={index} className="profile-line">
          {item.value ? item.value.trim() : ''}
        </div>
      ));
    }
    return <div className="profile-line">{data}</div>;
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm("Are you sure you want to delete your account? Your data is protected through Encryption. At any point you want us to delete your data, you can use the delete account option. We recommend that you download a copy of the data before you delete your account This action cannot be undone.");
    if (confirmation) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/user/data`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        localStorage.removeItem('token');
        window.location.reload();
        navigate("/");
      } catch (error) {
        console.error('Error deleting account:', error.message);
      }
    }
  };

  const handleDownloadData = () => {
    const decisionData = decisions.map(decision => ({
      'Decision Name': decision.decision_name,
      'Decision Due Date': new Date(decision.decision_due_date).toLocaleDateString(),
      'Decision Taken Date': decision.decision_taken_date ? new Date(decision.decision_taken_date).toLocaleDateString() : '--',
      'Decision Details': decision.user_statement,
      'Tags': decision.tags ? decision.tags.map(tag => tag.tag_name).join(', ') : '',
      'Decision Reasons': decision.decision_reason ? decision.decision_reason.map(reason => reason.decision_reason_text).join(', ') : ''
    }));

    const worksheetDecisions = XLSX.utils.json_to_sheet(decisionData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheetDecisions, 'Decisions Data');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'decisions_data.xlsx');
    if (data) {
      toast('downloaded successfully')
    }
  };


  const handleDownloadProfile = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Profile Data:', 20, 20);

    const extractData = (data) => {
      if (Array.isArray(data)) {
        return data.map(item => (item.value ? item.value.trim() : '')).join('\n\n');
      }
      return data ? data.trim() : 'N/A';
    };

    const profileData = [
      { category: 'Strength', details: extractData(formData.strength), color: [13, 97, 16] },
      { category: 'Weakness', details: extractData(formData.weakness), color: [41, 128, 185] },
      { category: 'Opportunity', details: extractData(formData.opportunity), color: [153, 77, 28] },
      { category: 'Threat', details: extractData(formData.threat), color: [165, 42, 42] }
    ];

    let yPos = 40;
    const cellWidth = (doc.internal.pageSize.width - 60) / 2;
    const cellHeight = 50; // Adjust cell height as needed
    const rowSpacing = 80; // Adjust vertical spacing between rows
    const colSpacing = 10; // Adjust horizontal spacing between columns

    profileData.forEach((item, index) => {
      const rowIndex = Math.floor(index / 2);
      const colIndex = index % 2;

      const xPos = 20 + (colIndex * (cellWidth + colSpacing));

      // Set cell properties
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      doc.text(item.category, xPos, yPos + (rowIndex * (cellHeight + rowSpacing)) - 10);

      // Create autoTable for each cell
      doc.autoTable({
        startY: yPos + (rowIndex * (cellHeight + rowSpacing)),
        margin: { left: xPos },
        head: [[item.category]],
        body: item.details.split('\n\n').map(detail => [detail]),
        theme: 'grid',
        headStyles: {
          fillColor: item.color,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          cellPadding: 4,
          textColor: 'black',
          fontSize: 12,
          valign: 'middle',
          lineWidth: 0.1,
          cellWidth: cellWidth - 10
        },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        rowStyles: {
          0: { fillColor: [240, 240, 240] },
          1: { fillColor: [245, 230, 235] }
        }
      });
    });

    doc.save('profile_data.pdf');
    toast('Profile data downloaded successfully');
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className='spinner'></div>
      </div>
    );
  }

  const handleViewLinkedDecisions= () =>{

  }

  return (
    <div className="card1">
      <div >
        <h3>Profile</h3>
        <div className=''>
          <div className='data-aroundd'>
            <div>
              {userData.profilePicture && (
                <div>
                  <img src={userData.profilePicture} alt="Profile" className="profile-picture" />
                </div>
              )}
            </div>
            <button className='linked-decisions'>
              <Link to='/getall' className='linked-decisions'>
                <p>View Linked Decisions</p>
              </Link>
            </button>
          </div>
        </div>
        <div>
          <strong>Username:</strong>
          <span>{userData.displayname}</span>
        </div>
        <div>
          <strong>Email:</strong>
          <span>{userData.email}</span>
        </div>
        <div className='details'>
          <Link to='/profiletab'>
            <button className='profiletab'>Edit Detail</button>
          </Link>
          <div>
            <Link to='/profiletab'>
              <FaUserEdit className='iconn' />
            </Link>
          </div>
        </div>
        {Object.keys(formData).length ? (
          <div className="profile-details">
            {/* <div className="profile-field">
              <strong>Gender: </strong>
              <span>{formData.gender}</span>
            </div> */}
            <div className='addition-one'>
              <p><b>Desc:</b> Your ability to take better decisions is influenced by your Self Awareness. Profile section enables you to add more details about yourself that can be aligned with your decisions.</p>
              <button onClick={() => window.location.href = 'https://academy.greenestep.com/courses/swot-analysis/'} className='analysis'>
                SWOT Analysis
              </button>
            </div>
            {formData.attitude && (
              <div className="sub-card">
                <strong>Attitude: </strong>
                {renderLines(formData.attitude)}
              </div>
            )}
            {formData.strength && (
              <div className="sub-card">
                <strong>Strength: </strong>
                {renderLines(formData.strength)}
              </div>
            )}
            {formData.weakness && (
              <div className="sub-card">
                <strong>Weakness: </strong>
                {renderLines(formData.weakness)}
              </div>
            )}
            {formData.opportunity && (
              <div className="sub-card">
                <strong>Opportunity: </strong>
                {renderLines(formData.opportunity)}
              </div>
            )}
            {formData.threat && (
              <div className="sub-card">
                <strong>Threat: </strong>
                {renderLines(formData.threat)}
              </div>
            )}
          </div>
        ) : (
          <div>No data available</div>
        )}
      </div>
      <div className='data-around'>
        <div className='download-data'>
          <p onClick={handleDownloadData}>Download my Decision data</p>
        </div>
        <div className='download-profile'>
          <p onClick={handleDownloadProfile}>Download Profile data</p>
        </div>
        <ToastContainer />
      </div>
      <center>
        <div className='delete-button'>
          <div className='delete-account'>
            <p onClick={handleDeleteAccount}>Delete Account</p>
          </div>
        </div>
      </center>
    </div>
  );
};

export default withAuth(Profile);