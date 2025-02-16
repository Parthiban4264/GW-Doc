import React from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import ProjectWorkflow from './pages/ProjectWorkflow';
import SignupForm from './components/SignupForm';
import SigninForm from './components/SigninForm';
import useAuthStore from './stores/authStore';

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <Routes>
            <Route 
              path="/" 
              element={isAuthenticated ? <ProjectList /> : <Navigate to="/signin" />} 
            />
            <Route 
              path="/project/:projectId/*" 
              element={isAuthenticated ? <ProjectWorkflow /> : <Navigate to="/signin" />} 
            />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/signin" element={<SigninForm />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
