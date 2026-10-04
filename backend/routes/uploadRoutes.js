import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../utils/cloudinary.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Use memory storage — multer-storage-cloudinary v4 is NOT compatible with multer v2
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image provided" });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'campus_matrix_profiles',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      resource_type: 'image',
    },
    (error, result) => {
      if (error) {
        console.error("Cloudinary Upload Error:", error);
        return res.status(500).json({ message: "Image upload failed", error: error.message });
      }
      console.log("Cloudinary Upload Success:", result.secure_url);
      res.status(200).json({ imageUrl: result.secure_url });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

export default router;
