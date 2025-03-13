const express = require('express');
const router = express.Router();
const petyayaController = require('../controllers/petyayaController');
const Post = require('../../models/posts');

// Home route (index page)
router.get('/', petyayaController.index);

// ---------------------- Post Routes ----------------------

// Feed page that displays all posts
router.get('/feed', petyayaController.posts);

// Add a new post
router.post('/add-post', petyayaController.addPost);

// Edit a post
router.post('/edit-post/:id', async (req, res) => {
    await Post.findByIdAndUpdate(req.params.id, { content: req.body.content });
    res.redirect('/feed');
});

// Delete a post
router.delete('/delete-post/:id', petyayaController.deletePost);

// Like a post
router.post('/like-post/:id', petyayaController.likePost);

// ---------------------- Comment Routes ----------------------

// Add a comment to a post
router.post('/add-comment/:id', petyayaController.addComment);

// Edit a comment
router.post('/edit-comment/:id', async (req, res) => {
    await Post.updateOne(
      { "comments._id": req.params.id },
      { $set: { "comments.$.text": req.body.content } }
    );
    res.redirect('/feed');
});

// Delete a comment
router.delete("/delete-comment/:commentId", async (req, res) => {
    try {
        const { commentId } = req.params;
        const post = await Post.findOne({ "comments._id": commentId });

        if (!post) return res.status(404).send("Comment not found");

        post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);
        await post.save();
        res.redirect("/feed");
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Like a comment
router.post('/like-comment/:commentId', petyayaController.likeComment);

// ---------------------- Reply Routes ----------------------

// Add a reply to a comment
router.post("/reply-to-comment/:commentId", petyayaController.addReplyToComment);

// Like a reply
router.post('/like-reply/:id', petyayaController.likeReply);

// Edit a reply
router.post('/edit-reply/:id', async (req, res) => {
    await Post.updateOne(
      { "comments.replies._id": req.params.id },
      { $set: { "comments.$[].replies.$[reply].text": req.body.content } },
      { arrayFilters: [{ "reply._id": req.params.id }] }
    );
    res.redirect('/feed');
});

// Delete a reply
router.delete("/delete-reply/:commentId/:replyId", async (req, res) => {
    try {
        const { commentId, replyId } = req.params;
        const post = await Post.findOne({ "comments._id": commentId });

        if (!post) return res.status(404).send("Comment not found");

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

// Reply to a reply
router.post('/reply-to-reply/:postId/:commentId/:replyId', petyayaController.addReplyToReply);

module.exports = router;