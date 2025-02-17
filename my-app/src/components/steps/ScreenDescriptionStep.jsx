import React, { useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Bars3Icon } from '@heroicons/react/24/solid';
import useLocalStorage from '../../hooks/useLocalStorage';

const DraggableScreen = ({ id, index, image, description, moveScreen, onDescriptionChange }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'screen',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'screen',
    hover: (item) => {
      if (item.index !== index) {
        moveScreen(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`flex items-center space-x-6 p-4 bg-white rounded-lg ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <Bars3Icon className="h-6 w-6 text-gray-400 cursor-move" />
      <div className="w-1/3">
        <img
          src={image.preview}
          alt={image.name}
          className="w-full h-auto rounded-lg"
        />
      </div>
      <div className="w-2/3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Screen Description
          </span>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="4"
            maxLength="200"
            placeholder="Describe this screen's functionality..."
          />
        </label>
        <p className="mt-1 text-sm text-gray-500">
          {description.length} / 200 characters
        </p>
      </div>
    </div>
  );
};

function ScreenDescriptionStep({ projectId, onNext, onBack }) {
  const [images] = useLocalStorage(`project-${projectId}-images`, []);
  const [descriptions, setDescriptions] = useLocalStorage(
    `project-${projectId}-descriptions`,
    {}
  );
  const [screenOrder, setScreenOrder] = useLocalStorage(
    `project-${projectId}-screen-order`,
    images.map(img => img.id)
  );

  useEffect(() => {
    // Initialize descriptions with filenames if not already set
    const newDescriptions = { ...descriptions };
    images.forEach(image => {
      if (!descriptions[image.id]) {
        newDescriptions[image.id] = `Description for ${image.name}`;
      }
    });
    setDescriptions(newDescriptions);
  }, [images]);

  const moveScreen = (fromIndex, toIndex) => {
    const newOrder = [...screenOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setScreenOrder(newOrder);
  };

  const handleDescriptionChange = (imageId, description) => {
    setDescriptions(prev => ({
      ...prev,
      [imageId]: description
    }));
  };

  // Filter out any invalid image IDs and ensure we have valid images
  const orderedImages = screenOrder
    .map(id => images.find(img => img.id === id))
    .filter(image => image && image.preview);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Describe UI Screens</h2>
          <p className="mt-1 text-sm text-gray-500">
            Add descriptions for each screen and drag to reorder them
          </p>
        </div>

        <div className="space-y-4">
          {orderedImages.map((image, index) => (
            <DraggableScreen
              key={image.id}
              id={image.id}
              index={index}
              image={image}
              description={descriptions[image.id] || ''}
              moveScreen={moveScreen}
              onDescriptionChange={handleDescriptionChange}
            />
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
                p.id === projectId ? { ...p, currentStep: 'requirements' } : p
              );
              localStorage.setItem('projects', JSON.stringify(updatedProjects));
            
              onNext('requirements');
            }}
            disabled={!orderedImages.every(image => descriptions[image.id]?.trim())}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Next Step
          </button>
        </div>
      </div>
    </DndProvider>
  );
}

export default ScreenDescriptionStep;
