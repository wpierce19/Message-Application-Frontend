import { Route, Routes, Link, Navigate } from 'react-router-dom';
import './App.css'
import { Component, useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (console.log("Hi"))
}

export default App
