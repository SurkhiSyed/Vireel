import React, { useEffect, useState } from 'react';
import FileUpload from './components/FileUpload';
import GooglePicker from './components/GooglePicker'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import UploadData from './pages/UploadData';
import Login from './pages/Login';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase-config';
import DataUpload from './components/DataUpload';
import ChatPage from './pages/ChatPage';
import Notification from './components/notification/Notification';
import News from './pages/News';
import {useUserStore} from './lib/userStore'
import { useChatStore } from './lib/chatStore';

function App() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem('isAuth'));

  const {currentUser,isLoading,fetchUserInfo} = useUserStore()
  const {chatId} = useChatStore()

  const signUserOut = () => {
    signOut(auth).then(() => {
      localStorage.clear();
      setIsAuth(false);
      window.location.pathname = "/login";
    });
  };

  useEffect(() => {
    const unSub = onAuthStateChanged(auth,(user)=>{
      fetchUserInfo(user?.uid)
    })
    return () => {
      unSub()
    }
  },[fetchUserInfo])

  if(isLoading) return <div className='loading'>Loading...</div>

  return (
    <Router>
      <nav>
        <Link to='/'> Home </Link>
        <Link to='/upload'> Upload </Link>
        {!currentUser ? (
          <Link to="/login"> Login </Link>
        ) : (
          <>
          <button onClick={signUserOut}> Log Out</button>
          <Link to="/fileupload"> File Upload</Link>
          <Link to="/googlepicker"> File Upload</Link>
          <Link to="/dataupload"> Data Upload</Link>
          <Link to="/chat"> Chat </Link>
          <Link to="/news"> News </Link>            
        </>
        )}
      </nav>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/upload' element={<UploadData/>} />
        <Route path='/login' element={<Login setIsAuth={setIsAuth}/>} />
        <Route path='/fileupload' element={<FileUpload/>}/>
        <Route path='/googlepicker' element={<GooglePicker/>}/>
        <Route path='/dataupload' element={<DataUpload/>}/>
        <Route path='/chat' element={<ChatPage/>}/>
        <Route path='/news' element={<News/>}/>
      </Routes>
    </Router>
  );
}

export default App;
