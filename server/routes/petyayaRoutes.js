const express = require('express');
const router = express.Router();
const petyayaController = require('../controllers/petyayaController')
const { ensureAuthenticated } = require('../middleware/auth');
const Post = require('../../models/posts');

router.get('/', petyayaController.index)
// Routes now protected (need to login to access)
router.get('/feed', ensureAuthenticated, petyayaController.posts);
router.post('/add-post', ensureAuthenticated, petyayaController.addPost);
router.put('/edit-post/:id', ensureAuthenticated, petyayaController.editPost);
router.delete('/delete-post/:id', ensureAuthenticated, petyayaController.deletePost);
router.get('/profile', ensureAuthenticated, petyayaController.profile);

// Like a post
router.post('/like-post/:id', petyayaController.likePost);

// Add a comment to a post
router.post('/add-comment/:id', petyayaController.addComment);

// Edit a comment
router.post('/edit-comment/:id', petyayaController.editComment);

// Delete a comment
router.delete("/delete-comment/:commentId", petyayaController.deleteComment);

// Like a comment
router.post('/like-comment/:commentId', petyayaController.likeComment);

// ---------------------- Reply Routes ----------------------

// Add a reply to a comment
router.post("/reply-to-comment/:commentId", petyayaController.addReplyToComment);

// Like a reply
router.post('/like-reply/:replyId', petyayaController.likeReply);

// Edit a reply
router.post('/edit-reply/:id', petyayaController.editReply);

// Delete a reply
router.delete("/delete-reply/:commentId/:replyId", petyayaController.deleteReply);

// Reply to a reply
router.post('/reply-to-reply/:postId/:commentId/:replyId', petyayaController.addReplyToReply);

module.exports = router;