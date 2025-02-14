import React from 'react';
import { UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline';

const ProjectCard = ({ project }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold">{project.name}</h2>
      <p className="text-gray-600 mt-2">{project.description}</p>
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>Created: {formatDate(project.createdAt)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <UserGroupIcon className="w-4 h-4 mr-2" />
          <span>{project.teamMembers.join(', ')}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
