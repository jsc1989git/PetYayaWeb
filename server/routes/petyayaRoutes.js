const express = require('express');
const router = express.Router();
const petyayaController = require('../controllers/petyayaController');
const upload = require('../middleware/upload'); // Import Cloudinary-based upload middleware

router.get('/', petyayaController.index);
router.get('/dashboard', petyayaController.posts);
router.post('/add-post', petyayaController.addPost);
router.put('/edit-post/:id', petyayaController.editPost);
router.delete('/delete-post/:id', petyayaController.deletePost);

// Use the Cloudinary upload middleware
router.post('/upload', upload.single('image'), petyayaController.uploadImage);

module.exports = router;
