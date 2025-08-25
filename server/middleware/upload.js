// In server/middleware/upload.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mobile-shop-testimonials', // A folder name in your Cloudinary account
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
    transformation: [{ width: 200, height: 200, crop: 'limit' }] // Optional: Resize images
  },
});

const upload = multer({ storage: storage }).single('profileImage');

module.exports = upload;