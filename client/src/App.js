import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';
import 'react-toastify/dist/ReactToastify.css';
import Home from './Components/Home';
import Header from './Components/Header';
import Dashboard from './Components/DashBoard/Dashboard';
// import Error from './Components/Error';
import BasicInform from './Components/pages/Basic_Inform.js';
import Personal from './Components/pages/Personal_Inform.js';
import Read from './Components/pages/Profile_Table/Read';
// import View from './Components/pages/Profile_Table/View';
import Decision from './Components/pages/Decision/Decision.js';
import Readd from './Components/pages/Decision/Readd.js';
import View from './Components/pages/Decision/View.js';
import Profile from './Components/DashBoard/Profile.js';
import InnerCircle from './Components/Group/InnerGroup.js';
import MultipleMemberGroup from './Components/Group/MultipleMemberGroup.js';
import DisplayInnerCircle from './Components/Group/DisplayInnerCircle.js';
import AcceptOrNot from './Components/Group/AcceptOrNot.js';
import Notification from './Components/Notification/Notification.js';
import SharedDecision from './Components/Group/SharedDecisions.js';

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
        {/* <Route path='/login' element={<Login />} /> */}
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/decision' element={<Decision />} />

        {/* Profile Routes */}
        <Route path='/basic' element={<BasicInform />} />
        <Route path='/personal' element={<Personal />} />
        <Route path='/read' element={<Read />} />
        {/* <Route path='/view' element={<View />} /> */}

        {/* Decision Routes */}
        <Route path='/decision' element={<Decision />} />
        <Route path='/decision/:id' element={<Decision />} />
        <Route path='/readd' element={<Readd />} />
        <Route path='/views/:id' element={<View />} />
        {/* <Route path='*' element={<Error/>}/> */}

        {/* Create Group Routes */}
        <Route path='/innerCircle' element={<InnerCircle />} />
        <Route path='/group' element={<MultipleMemberGroup />} />
        <Route path='/innerCircleDisplay' element={<DisplayInnerCircle />} />
        <Route path='/shareAcceptOrNot' element={<AcceptOrNot />} />

        {/* Notification */}
        <Route path='/notification' element={<Notification />} />

        <Route path='/sharedDecisions' element={<SharedDecision />} />

      </Routes>
    </div>
  );
}

export default App;
