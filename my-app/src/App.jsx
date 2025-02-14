import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import ProjectWorkflow from './pages/ProjectWorkflow';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/project/:projectId/*" element={<ProjectWorkflow />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
