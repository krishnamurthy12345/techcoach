import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';
import 'react-toastify/dist/ReactToastify.css';
import Home from './Components/Home';
import Header from './Components/Header';
import Decision from './Components/pages/Decision/Decision.js';
import Readd from './Components/pages/Decision/Readd.js';
import View from './Components/pages/Decision/View.js';
import Profile from './Components/pages/Profile_Table/Profile.js';
import InnerCircle from './Components/Group/InnerGroup.js';
import MultipleMemberGroup from './Components/Group/MultipleMemberGroup.js';
import DisplayInnerCircle from './Components/Group/DisplayInnerCircle.js';
import AcceptOrNot from './Components/Group/AcceptOrNot.js';
import Notification from './Components/Notification/Notification.js';
import ProfileTab from './Components/pages/Profile_Table/ProfileTab.js';
import SharedDecision from './Components/Group/SharedDecisions.js';
import DashboardRedirect from '../src/Components/DashboardRedirect.js'; 
import ReceivedDecisionsTab from '../src/Components/DashBoard/ReceivedDecisionsTab.js'; 
import ShareWithMe from './Components/DashBoard/ShareWithMe.js';
import SoftSkill from './Components/pages/Soft_Skill/Soft_Skill.js';
import Skillget from './Components/pages/Soft_Skill/Skillget.js';
import EditSkill from './Components/pages/Soft_Skill/EditSkill.js';

function App() {
  console.log("one is working")

  useEffect(() => {
    const setAuthToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    };
    setAuthToken();
  },[]); 

  return (
    <div>
      <Header />
      <Routes>
        {/* Dashboard Routes */}
        <Route path='/' element={<Home />} />
        {/* <Route path='/dashboard' element={<Nav />} /> */}
        <Route path='/dashboard' element={<DashboardRedirect />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/decision' element={<Decision />} />

        {/* Profile Routes */}
        <Route path='/profiletab' element={<ProfileTab />} />

        <Route path='/receivedDecisions' element={<ReceivedDecisionsTab />} />

        {/* Soft_Skills Routes */}
        <Route path='/softskill' element={<SoftSkill />} />
        <Route path='/skillget' element={<Skillget />} />
        <Route path='/editskill/:id' element={<EditSkill />} />


        {/* Decision Routes */}
        <Route path='/decision' element={<Decision />} />
        <Route path='/decision/:id' element={<Decision />} />
        <Route path='/readd' element={<Readd />} />
        <Route path='/views/:id' element={<View />} />

        {/* Share Decision */}
        <Route path='/sharedDecisions' element={<SharedDecision />} />
        <Route path='/sharedByMe' element={<ShareWithMe />} />


        {/* Create Group Routes */}
        <Route path='/innerCircle' element={<InnerCircle />} />
        <Route path='/group' element={<MultipleMemberGroup />} />
        <Route path='/innerCircleDisplay' element={<DisplayInnerCircle />} />
        <Route path='/shareAcceptOrNot' element={<AcceptOrNot />} />

        {/* Notification */}
        <Route path='/notification' element={<Notification />} />


      </Routes>
    </div>
  );
}

export default App;
