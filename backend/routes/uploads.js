const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/**
 * @swagger
 * /api/uploads:
 *   post:
 *     summary: Upload images
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 */
router.post('/', upload.array('files'), async (req, res, next) => {
  try {
    const files = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
    }));
    
    await req.app.locals.db.saveUploads(files);
    res.status(201).json(files);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/uploads:
 *   get:
 *     summary: Retrieve all uploaded images
 *     tags: [Uploads]
 *     responses:
 *       200:
 *         description: List of uploaded images
 */
router.get('/', async (req, res, next) => {
  try {
    const uploads = await req.app.locals.db.getAllUploads();
    res.json(uploads);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
