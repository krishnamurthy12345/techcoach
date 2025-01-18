import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import Home from './Components/Home';
import Header from './Components/Header';
import Admin from './Components/Admin/Admin.js';
import AdminView from './Components/Admin/AdminView.js';
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
import AddLink from './Components/pages/Decision-Link/AddLink.js';
import GetLink from './Components/pages/Decision-Link/GetLink.js';
import DecisionCircle from './Components/Decision_Circle/DecisionCircle.js';
import GetGroup from './Components/Decision_Circle/GetGroup.js';
import ShareCircle from './Components/Decision_Circle/ShareCircle.js';
import DecisionGroup from './Components/Decision_Circle/DecisionGroup.js';
import ShowUsers from './Components/Decision_Circle/ShowUsers.js';
import ShareCircleGroup from './Components/Decision_Circle/ShareCircleGroup.js';
import MemberSharedDecisions from './Components/Decision_Circle/MemberSharedDecisions.js';
import SharedDecisionCircle from './Components/Decision_Circle/SharedDecisionCircle.js';
import AdvancedProfile from './Components/pages/Profile_Table/AdvancedProfile.js';
import AdvancedProfileTable from './Components/pages/Profile_Table/AdvancedProfileTable.js';
import Rating from './Components/pages/Ratings/Rating.js';
import EditRating from './Components/pages/Ratings/EditRating.js';
import EmojiReaction from './Components/pages/Decision/EmojiReaction/EmojiReaction.js';
import GetAllEmoji from './Components/pages/Decision/EmojiReaction/GetAllEmoji.js';
import AddMobileNumber from './Components/Notification/AddMobileNumber.js';
import CommentRating from './Components/pages/CommentRating/CommentRating.js';
import CommentRatingView from './Components/pages/CommentRating/CommentRatingView.js';
import CommentRatingEdit from './Components/pages/CommentRating/CommentRatingEdit.js';

function App() {
  console.log("one is working")

  useEffect(() => {
    const setAuthToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    };

    const setupAxiosInterceptors = () => {
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response && error.response.status === 401) {
            toast.error('Session expired. Please log in again.', {
              position: 'top-right',
              autoClose: 5000,
            });
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            window.location.href = '/'; 
          }
          return Promise.reject(error);
        }
      );
    };


    setAuthToken();
    setupAxiosInterceptors();
  },[]); 

  return (
    <div>
      <Header />
      <Routes>
        {/* Dashboard Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/adminView/:id' element={<AdminView />} />
        <Route path='/dashboard' element={<DashboardRedirect />} />
        <Route path='/decision' element={<Decision />} />
        <Route path='/decisioncircle' element={<DecisionCircle />} />
        <Route path='/innerCircle' element={<InnerCircle />} />
        <Route path='/profile' element={<Profile />} />
        <Route path = '/advancedProfile' element={<AdvancedProfile />} />
        <Route path='/softskill' element={<SoftSkill />} />


        {/* Profile Routes */}
        <Route path='/profiletab' element={<ProfileTab />} />
        <Route path = '/advancedProfileTable' element={<AdvancedProfileTable />} />


        {/* Soft_Skills Routes */}
        <Route path='/skillget' element={<Skillget />} />
        <Route path='/editskill/:id' element={<EditSkill />} />


        {/* decision-swot-skill Routes */}
        <Route path='/link/:id' element={<AddLink />} />
        <Route path='/getall' element={<GetLink />} />


        {/* Soft_Skills Routes */}
        <Route path='/skillget' element={<Skillget />} />
        <Route path='/editskill/:id' element={<EditSkill />} />

        {/* Decision Routes */}
        <Route path='/decision' element={<Decision />} />
        <Route path='/decision/:id' element={<Decision />} />
        <Route path='/readd' element={<Readd />} />
        <Route path='/views/:id' element={<View />} />


        {/* Create Decision Circle Routes */}
        <Route path='/decisioncircle/:id' element={<DecisionCircle />} />
        <Route path='/getdecisioncircle' element={<GetGroup />} />
        <Route path='/decisiongroup' element={<DecisionGroup />} />
        <Route path='/decisiongroup/:id' element={<DecisionGroup />} />
        <Route path='/getdecisioncircle/:groupId' element={<ShowUsers />} />
        <Route path='/sharecircle/:id' element={<ShareCircle />}/>
        <Route path='/shareCircleDisplay/:id' element={<ShareCircleGroup />} />
        <Route path="/getmembershareddecisions/:groupId" element={<MemberSharedDecisions />} />


        {/* Share Decision */}
        <Route path='/sharedDecisions' element={<SharedDecision />} />
        <Route path='/sharedByMe' element={<ShareWithMe />} />
        <Route path='/receivedDecisions' element={<ReceivedDecisionsTab />} />
        <Route path='/sharedDecisionCircle' element={<SharedDecisionCircle />} />


        <Route path='/group' element={<MultipleMemberGroup />} />
        <Route path='/innerCircleDisplay' element={<DisplayInnerCircle />} />
        <Route path='/shareAcceptOrNot' element={<AcceptOrNot />} />


        {/* Notification */}
        <Route path='/notification' element={<Notification />} />
        <Route path='/numberAdd' element={<AddMobileNumber />} />


        {/* Ratings */}
        <Route path='/rating/:id' element={<Rating />} />
        <Route path='/rating/edit/:decisionId' element={<EditRating/>} />

        {/* EmojiReaction Routes */}
        <Route path='/emoji/:comment_id/:emoji_id' element={<EmojiReaction />} />
        <Route path='/emoji/:comment_id/:emoji_id' element={<GetAllEmoji />} />

        {/* CommentRating Routes */}
        <Route path='/commentRating' element={<CommentRating />} />
        <Route path='/commentRating/overAll/:commentId' element={<CommentRatingView />} />
        <Route path='/commentRating/edit/:commentId' element={<CommentRatingEdit />} />

      </Routes>
    </div>
  );
}

export default App;
