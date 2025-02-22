const express = require('express');
const router = express.Router();
const petyayaController = require('../controllers/petyayaController')

router.get('/', petyayaController.index)
router.get('/dashboard', petyayaController.posts)
router.post('/add-post', petyayaController.addPost)
router.put('/edit-post/:id', petyayaController.editPost)
router.delete('/delete-post/:id', petyayaController.deletePost);

module.exports = router;