import React from 'react';
import { useDropzone } from 'react-dropzone';
import useLocalStorage from '../../hooks/useLocalStorage';

function ImageUploadStep({ projectId, onNext, isFirstStep }) {
  const [images, setImages] = useLocalStorage(`project-${projectId}-images`, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 20,
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        preview: URL.createObjectURL(file)
      }));
      setImages([...images, ...newImages]);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Upload UI Screens</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload up to 20 screenshots of your application's UI screens
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center ${
          isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-gray-600">
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <p>Drag & drop files here, or click to select files</p>
            )}
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
        </div>
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

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => onNext('describe')}
          disabled={images.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

export default ImageUploadStep;
