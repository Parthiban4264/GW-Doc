import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProjectModal from '../components/CreateProjectModal';
import useLocalStorage from '../hooks/useLocalStorage';
import { marked } from 'marked';
import MarkdownEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

function ProjectList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();
  const [projects] = useLocalStorage('projects', []);

  const handleCreateSuccess = (project) => {
    setIsModalOpen(false);
    // Get existing projects
    const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    // Add new project
    const updatedProjects = [...existingProjects, { ...project, isComplete: false, currentStep: 'upload' }];
    // Save back to localStorage
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    navigate(`/project/${project.id}/upload`);
  };

  const handleProjectClick = (project) => {
    if (project.isComplete) {
      const apiDocs = localStorage.getItem(`project-${project.id}-api-docs`);
      const flowDoc = localStorage.getItem(`project-${project.id}-flow-document`);
      
      setSelectedProject({
        ...project,
        apiDocs,
        flowDoc
      });
      setShowDocsModal(true);
    } else {
      // If project has a currentStep, use it, otherwise start from upload
      const currentStep = project.currentStep || 'upload';
      
      // Navigate to the current step
      navigate(`/project/${project.id}/${currentStep}`);
    }
  };

  // Add useEffect to update projects when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      if (JSON.stringify(projects) !== JSON.stringify(storedProjects)) {
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage your application documentation projects
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Create Project
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Modified Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created By</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Team Members</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr 
                        key={project.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleProjectClick(project)}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {project.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{project.created_at}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{project.updated_at}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{project.created_by}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {project.team_members.join(', ')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            project.isComplete 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.isComplete ? 'Completed' : 'In Progress'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Documentation Modal */}
      {showDocsModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name} Documentation</h2>
              <button
                onClick={() => setShowDocsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h3 className="text-xl font-semibold text-gray-900">API Documentation</h3>
                </div>
                <div className="p-6 bg-white">
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: marked(selectedProject.apiDocs || 'No API documentation available', {
                        breaks: true,
                        gfm: true
                      }) 
                    }} />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h3 className="text-xl font-semibold text-gray-900">Application Flow</h3>
                </div>
                <div className="p-6 bg-white">
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: marked(selectedProject.flowDoc || 'No flow documentation available', {
                        breaks: true,
                        gfm: true
                      }) 
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectList;
