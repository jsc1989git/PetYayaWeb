const express = require('express');
const router = express.Router();
const petyayaController = require('../controllers/petyayaController')
const { ensureAuthenticated } = require('../middleware/auth');
const Post = require('../../models/posts');

router.get('/', petyayaController.index)
// Routes now protected (need to login to access)
router.get('/feed', ensureAuthenticated, petyayaController.posts);
router.post('/add-post', ensureAuthenticated, petyayaController.addPost);
router.post('/add-post-profile', ensureAuthenticated, petyayaController.addPostProfile);
router.put('/edit-post/:id', ensureAuthenticated, petyayaController.editPost);
router.delete('/delete-post/:id', ensureAuthenticated, petyayaController.deletePost);
router.get('/profile', ensureAuthenticated, petyayaController.profile);

// Like a post
router.post('/like-post/:id', ensureAuthenticated, petyayaController.likePost);

// Add a comment to a post
router.post('/add-comment/:id', ensureAuthenticated, petyayaController.addComment);

// Edit a comment
router.post('/edit-comment/:id', ensureAuthenticated, petyayaController.editComment);

// Delete a comment
router.delete("/delete-comment/:commentId", ensureAuthenticated, petyayaController.deleteComment);

// Like a comment
router.post('/like-comment/:commentId', ensureAuthenticated, petyayaController.likeComment);

// ---------------------- Reply Routes ----------------------

// Add a reply to a comment
router.post("/reply-to-comment/:commentId", ensureAuthenticated, petyayaController.addReplyToComment);

// Like a reply
router.post('/like-reply/:replyId', ensureAuthenticated, petyayaController.likeReply);

// Edit a reply
router.post('/edit-reply/:id', ensureAuthenticated, petyayaController.editReply);

// Delete a reply
router.delete("/delete-reply/:commentId/:replyId", ensureAuthenticated, petyayaController.deleteReply);

// Reply to a reply
router.post('/reply-to-reply/:postId/:commentId/:replyId', ensureAuthenticated, petyayaController.addReplyToReply);

module.exports = router;