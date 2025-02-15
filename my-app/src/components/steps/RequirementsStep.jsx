import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { marked } from 'marked';
import { generateRequirementsFromDescription } from '../../services/openai';

function RequirementsStep({ projectId, onNext, onBack }) {
  const [images] = useLocalStorage(`project-${projectId}-images`, []);
  const [descriptions] = useLocalStorage(`project-${projectId}-descriptions`, {});
  const [screenOrder] = useLocalStorage(`project-${projectId}-screen-order`, []);
  const [requirements, setRequirements] = useLocalStorage(
    `project-${projectId}-requirements`,
    {}
  );
  const [loading, setLoading] = useState({});

  const generateRequirements = async (imageId) => {
    setLoading(prev => ({ ...prev, [imageId]: true }));
    try {
      const image = images.find(img => img.id === imageId);
      const description = descriptions[imageId];
      
      // Convert image to base64
      const response = await fetch(image.preview);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64Image = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      
      const requirements = await generateRequirementsFromDescription(
        image.name,
        description,
        base64Image
      );
      
      setRequirements(prev => ({
        ...prev,
        [imageId]: requirements
      }));
    } catch (error) {
      console.error('Failed to generate requirements:', error);
    } finally {
      setLoading(prev => ({ ...prev, [imageId]: false }));
    }
  };

  const orderedImages = screenOrder
    .map(id => images.find(img => img.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Generate Screen Requirements</h2>
        <p className="mt-1 text-sm text-gray-500">
          Generate detailed requirements for each screen based on the descriptions
        </p>
      </div>

      <div className="space-y-8">
        {orderedImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex space-x-6">
              <div className="w-1/3">
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-auto rounded-lg"
                />
                <p className="mt-2 text-sm font-medium text-gray-900">{image.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {descriptions[image.id]}
                </p>
              </div>
              <div className="w-2/3">
                {requirements[image.id] ? (
                  <div 
                    className="prose max-w-none prose-p:my-6 prose-p:leading-relaxed prose-headings:mt-8 prose-headings:mb-4 prose-ul:my-4 prose-li:my-2 prose-li:leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:whitespace-pre-wrap [&>p]:mb-6 [&_p]:mb-6 prose-p:after:content-[''] prose-p:after:block prose-p:after:h-6"
                    dangerouslySetInnerHTML={{ 
                      __html: marked(requirements[image.id]) 
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <button
                      onClick={() => generateRequirements(image.id)}
                      disabled={loading[image.id]}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading[image.id] ? 'Generating...' : 'Generate Requirements'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Previous Step
        </button>
        <button
          onClick={() => {
            // Update current step in project
            const projects = JSON.parse(localStorage.getItem('projects') || '[]');
            const updatedProjects = projects.map(p => 
              p.id === projectId ? { ...p, currentStep: 'flow' } : p
            );
            localStorage.setItem('projects', JSON.stringify(updatedProjects));
            
            onNext('flow');
          }}
          disabled={!orderedImages.every(image => requirements[image.id])}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

export default RequirementsStep;
