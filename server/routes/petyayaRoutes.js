const express = require('express');
const router = express.Router();
const petyayaController = require('../controllers/petyayaController');
const Post = require('../../models/posts');

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

// Route to edit a comment
router.put('/edit-comment/:commentId', petyayaController.editComment);

// Route to delete a comment
router.delete("/delete-comment/:commentId", async (req, res) => {
    try {
        const { commentId } = req.params;

        // Find the post that contains the comment
        const post = await Post.findOne({ "comments._id": commentId });

        if (!post) {
            return res.status(404).send("Comment not found");
        }

        // Remove the comment along with its replies
        post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);

        await post.save();
        res.redirect("/feed");
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Route to like a comment
router.post('/like-comment/:commentId', petyayaController.likeComment);

// Route to add a reply to a comment
router.post('/add-reply/:commentId', petyayaController.addReply);

// Route to like a reply
router.post('/like-reply/:id', petyayaController.likeReply);

// Route to edit a reply
router.put('/edit-reply/:id', petyayaController.editReply);

// Route to delete a reply
router.delete("/delete-reply/:commentId/:replyId", async (req, res) => {
    try {
        const { commentId, replyId } = req.params;

        // Find the post that contains the comment
        const post = await Post.findOne({ "comments._id": commentId });

        if (!post) {
            return res.status(404).send("Comment not found");
        }

        // Find the comment and remove the specific reply
        const comment = post.comments.find(comment => comment._id.toString() === commentId);
        if (comment) {
            comment.replies = comment.replies.filter(reply => reply._id.toString() !== replyId);
        }

        await post.save();
        res.redirect("/feed");
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Export the router
module.exports = router;