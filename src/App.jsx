import { Route, Routes, Link, Navigate, BrowserRouter } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.cs';

import Login from './components/UserLogin';
import Signup from './components/UserSignUp';
import MessageList from './components/MessageList';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [token, setToken] = useState(localStorage.getItem("jwt_token"));

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    if (token) localStorage.setItem("jwt_token", token);
  }, [user,token]);

  return (
    <BrowserRouter>
      <Header user={user} setUser={setUser} setToken={setToken} />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/messages" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login setUser={setUser} setToken={setToken} />} />
        <Route path="/register" element={<Signup setUser={setUser} setToken={setToken} />} />
        <Route path="/messages" element={user ? <MessageList /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;