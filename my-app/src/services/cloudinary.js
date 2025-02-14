import cloudinary from '../config/cloudinary';

export const uploadImageToCloudinary = async (file) => {
  try {
    // Convert file to base64
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: 'project-docs',
      resource_type: 'auto',
      transformation: {
        fetch_format: 'auto',
        quality: 'auto'
      }
    });

    return uploadResult.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};
