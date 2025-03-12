const express = require('express');
const router = express.Router();
const petyayaController = require('../controllers/petyayaController');

// Home route (index page)
router.get('/', petyayaController.index);

// Feed page that displays all posts
router.get('/feed', petyayaController.posts);

// Route to add a new post
router.post('/add-post', petyayaController.addPost);

// Route to edit an existing post
router.put('/edit-post/:id', petyayaController.editPost);

// Route to delete a post
router.delete('/delete-post/:id', petyayaController.deletePost);

// Route to like a post
router.post('/like-post/:id', petyayaController.likePost);

// Route to add a comment to a post
router.post('/add-comment/:id', petyayaController.addComment);

// Export the router
module.exports = router;