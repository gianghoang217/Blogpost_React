import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import BlogPostManager from './components/BlogPostManager';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import EditPost from './components/EditPost';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />}>
              <Route path="posts" element={<BlogPostManager />} />
              <Route path="home" element={<HomePage />} />
              <Route path="/posts/edit/:postId" element={<EditPost />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;