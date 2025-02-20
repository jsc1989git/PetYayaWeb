const express = require('express');
const router = express.Router();
const petyayaController = require('../controllers/petyayaController')

router.get('/', petyayaController.index)
router.get('/dashboard', petyayaController.posts)
router.get('/edit-post/:id', petyayaController.editPostForm)
router.post('/add-post', petyayaController.addPost)
router.delete('/delete-post/:id', petyayaController.deletePost);

module.exports = router;