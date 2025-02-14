import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import useLocalStorage from '../../hooks/useLocalStorage';
import { uploadImageToCloudinary } from '../../services/cloudinary';

function ImageUploadStep({ projectId, onNext, isFirstStep }) {
  const [images, setImages] = useLocalStorage(`project-${projectId}-images`, []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 20,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      setUploadError(null);
      
      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          try {
            const cloudinaryUrl = await uploadImageToCloudinary(file);
            console.log('Cloudinary upload response:', cloudinaryUrl);
            return {
              id: Date.now().toString() + Math.random(),
              name: file.name,
              size: file.size,
              preview: cloudinaryUrl,
              url: cloudinaryUrl
            };
          } catch (err) {
            console.error('Error uploading file to Cloudinary:', err);
            throw err;
          }
        });

        const newImages = await Promise.all(uploadPromises);
        setImages([...images, ...newImages]);
      } catch (error) {
        console.error('Error in onDrop:', error);
        setUploadError('Failed to upload images. Please try again.');
      } finally {
        setIsUploading(false);
      }
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

      <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center ${
        isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
      }`}>
        <input {...getInputProps()} disabled={isUploading} />
        <div className="space-y-2">
          {isUploading ? (
            <div className="text-gray-600">
              <p>Uploading images...</p>
              <div className="mt-2 w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="text-gray-600">
                {isDragActive ? (
                  <p>Drop the files here...</p>
                ) : (
                  <p>Drag & drop files here, or click to select files</p>
                )}
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
            </>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

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
