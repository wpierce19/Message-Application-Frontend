import { Route, Routes, Link, Navigate, BrowserRouter } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { refreshUserData } from './components/services/userService.js';
import './App.css';

import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import Login from './components/UserLogin.jsx';
import Signup from './components/UserSignUp.jsx';
import MessageList from './components/MessageList.jsx';
import Messages from './components/Messages.jsx';
import CreateMessage from './components/CreateMessage.jsx';
import LandingPage from "./components/LandingPage.jsx";
import ProfilePage from "./components/Profile.jsx";
import PublicProfile from './components/PublicProfile.jsx';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [token, setToken] = useState(localStorage.getItem("jwt_token"));

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    if (token) localStorage.setItem("jwt_token", token);
  }, [user,token]);

  useEffect(() => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    refreshUserData()
      .then((user) => setUser(user))
      .catch((err) => console.error("Failed to refresh user:", err));
  }
}, []);

  return (
    <BrowserRouter>
      <Toaster />
      <Header user={user} setUser={setUser} setToken={setToken} />
      <Routes>
        <Route path="/" element={user ? <Home user={user} /> : <LandingPage />} />
        <Route path="/home" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login setUser={setUser} setToken={setToken} />} />
        <Route path="/register" element={<Signup setUser={setUser} setToken={setToken} />} />
        <Route path="/messages" element={user ? <MessageList /> : <Navigate to="/login" />} />
        <Route path="/messages/new" element={user ? <CreateMessage /> : <Navigate to="/login" />} />
        <Route path="/messages/:id" element={user ? <Messages user={user} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={<PublicProfile />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;