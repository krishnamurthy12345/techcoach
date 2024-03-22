import './App.css';
import {Routes,Route} from 'react-router-dom';
import Home from './Components/Home';
import Header from './Components/Header';
import Login from './Components/Login';
import Dashboard from './Components/DashBoard/Dashboard';
// import Error from './Components/Error';
import Notification from './Components/pages/Notification';
import Profile from './Components/pages/Profile';
import Read from './Components/pages/Profile_Table/Read';
import View from './Components/pages/Profile_Table/View';
// import Update from './Components/pages/Profile_Table/Update';
import Decision from './Components/pages/Decision/Decision.js';
import Readd from './Components/pages/Decision/Readd.js';
// import Edit from './Components/pages/Decision/Update.js';


function App() {
  return (
    <div>
      <Header/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/notification' element={<Notification/>}/>
        <Route path='/decision' element={<Decision/>}/>
        <Route path='/decision/:id' element={<Decision/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/read' element={<Read/>}/>
        <Route path='/view' element={<View/>}/>
        {/* <Route path='/update' element={<Update/>}/> */}
        {/* <Route path='*' element={<Error/>}/> */}
        {/*  Decision Code */}
        <Route path='/readd' element={<Readd/>}/>
        {/* <Route path='/edit' element={<Edit/>}/> */}


      </Routes>
    </div>
  );
}

export default App;
