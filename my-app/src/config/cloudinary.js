import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'drj0wvueq',
  api_key: '228143669387956',
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET
});

export default cloudinary;
