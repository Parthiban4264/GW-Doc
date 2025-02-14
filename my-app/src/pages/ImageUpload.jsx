import { useEffect, useState } from 'react';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { useNavigate, useParams } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function ImageUpload() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [projects] = useLocalStorage('projects', []);
  const [images, setImages] = useLocalStorage(`project-${projectId}-images`, []);

  useEffect(() => {
    const currentProject = projects.find(p => p.id === projectId);
    setProject(currentProject);
  }, [projectId, projects]);

  const handleDrop = async (acceptedFiles) => {
    try {
      const uploadPromises = acceptedFiles.slice(0, 20).map(async (file) => {
        const cloudinaryUrl = await uploadImageToCloudinary(file);
        return {
          id: Date.now().toString(),
          name: file.name,
          size: file.size,
          preview: cloudinaryUrl,
          url: cloudinaryUrl
        };
      });

      const newImages = await Promise.all(uploadPromises);
      setImages([...images, ...newImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      // You may want to add error handling UI here
    }
  };

  const handleNext = () => {
    // Update current step in project
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, currentStep: 'describe' } : p
    );
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    navigate(`/project/${projectId}/describe`);
  };

  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Upload UI Screens - {project.name}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload up to 20 screenshots of your application's UI screens
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleDrop(Array.from(e.target.files))}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Select Files
        </label>
        <p className="mt-2 text-sm text-gray-500">or drag and drop up to 20 images</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={image.preview}
              alt={image.name}
              className="h-40 w-full object-cover rounded-lg"
            />
            <button
              onClick={() => setImages(images.filter(img => img.id !== image.id))}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
            <p className="mt-2 text-sm text-gray-500 truncate">{image.name}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={images.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

export default ImageUpload;
