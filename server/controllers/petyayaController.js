require('dotenv').config();
const mongoose = require('mongoose');
const Posts = require('../../models/posts');
const axios = require('axios');

const gMapAPIKey = process.env.GOOGLE_MAP_API_KEY;

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => console.log("Database connected"));

// Render homepage with cat images
exports.index = async (req, res) => {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search?limit=5');
        res.render('index', { catImages: response.data });
    } catch (error) {
        console.error("Error fetching cat images:", error);
        res.render('index', { catImages: [] });
    }
};

// Fetch all posts and render the feed page
exports.posts = async (req, res) => {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search?limit=5');
        const posts = await Posts.find({}).sort({ createdAt: -1 });
        res.render('home', { posts, catImages: response.data, googleMapsApiKey: gMapAPIKey });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.render('home', { posts: [], catImages: [] });
    }
};

// CRUD Operations for Posts
exports.addPost = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        const { content } = req.body.post; // Get post content from request body

        if (!content) {
            return res.status(400).json({ error: "Content is required" });
        }

        const newPost = new Posts({
            content,
            author: req.user.id, // Set the author to the logged-in user
        });

        await newPost.save();
        res.redirect("/feed");
    } catch (error) {
        console.error("Error adding post:", error);
        res.status(500).json({ error: "Error adding post" });
    }
};

exports.editPost = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }

        const post = await Posts.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ error: "You can only edit your own posts" });
        }

        post.content = req.body.post.content;
        await post.save();

        res.redirect('/feed');
    } catch (error) {
        console.error("Error editing post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.deletePost = async (req, res) => {
    try {
        // Ensure req.user exists before accessing id
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        // Validate post ID format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }

        // Find the post
        const post = await Posts.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if the logged-in user is the author
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own posts" });
        }

        // Delete post
        await post.deleteOne();
        res.redirect('/feed');

    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Error deleting post" });
    }
};

exports.likePost = async (req, res) => {
    try {
        const { userId } = req.body; // Ensure userId is sent in the request
        const post = await Posts.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const hasLiked = post.likes.includes(userId);

        if (hasLiked) {
            // Unlike: Remove userId from likes array
            post.likes = post.likes.filter(userId => userId !== userId);
        } else {
            // Like: Add userId to likes array
            post.likes.push(userId);
        }

        await post.save();

        res.json({ likes: post.likes.length, liked: !hasLiked });

    } catch (error) {
        console.error("Error liking/unliking post:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// CRUD Operations for Comments
exports.addComment = async (req, res) => {
    const post = await Posts.findById(req.params.id);
    if (post) {
        post.comments.push({ text: req.body.comment, likes: [], replies: [] });
        await post.save();
        res.redirect('/feed');
    } else {
        res.status(404).send("Post not found");
    }
};

exports.editComment = async (req, res) => {
    const post = await Posts.findOne({ 'comments._id': req.params.commentId });
    if (post) {
        post.comments.id(req.params.commentId).text = req.body.comment;
        await post.save();
        res.redirect('/feed');
    } else {
        res.status(404).json({ error: 'Comment not found' });
    }
};

exports.deleteComment = async (req, res) => {
    const post = await Posts.findOneAndUpdate({ 'comments._id': req.params.commentId },
        { $pull: { comments: { _id: req.params.commentId } } },
        { new
        : true }
    );
    if (post) {
        res.redirect('/feed');
    } else {
        res.status(404).json({ error: 'Comment not found' });
    }
};

exports.likeComment = async (req, res) => {
    const post = await Posts.findOne({ 'comments._id': req.params.commentId });
    if (post) {
        const comment = post.comments.id(req.params.commentId);
        if (!comment.likedBy.includes(req.user.id)) {
            comment.likes += 1;
            comment.likedBy.push(req.user.id);
        } else {
            comment.likes -= 1;
            comment.likedBy = comment.likedBy.filter(userId => userId !== req.user.id);
        }
        await post.save();
        res.json({ likes: comment.likes });
    } else {
        res.status(404).json({ error: 'Comment not found' });
    }
};

// CRUD Operations for Replies
exports.addReplyToComment = async (req, res) => {
    const post = await Posts.findOne({ 'comments._id': req.params.commentId });
    if (post) {
        post.comments.id(req.params.commentId).replies.push({ text: req.body.text, likes: 0 });
        await post.save();
        res.redirect('/feed');
    } else {
        res.status(404).send("Comment not found");
    }
};

exports.likeReply = async (req, res) => {
    try {
        const post = await Posts.findOne({ 'comments.replies._id': req.params.replyId });

        if (!post) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        // Find the comment that contains the reply
        const comment = post.comments.find(comment => comment.replies.id(req.params.replyId));

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Find the reply inside the comment
        const reply = comment.replies.id(req.params.replyId);

        if (!reply) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        if (!reply.likedBy.includes(req.user._id)) {
            reply.likes -= 1;
            reply.likedBy.push(req.user.id);
        } else {
            reply.likes += 1;
            reply.likedBy = reply.likedBy.filter(userId => userId !== req.user.id);
        }
        await post.save();

        res.json({ likes: reply.likes });

    } catch (error) {
        console.error("Error liking reply:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.editReply = async (req, res) => {
    await Posts.updateOne({ 'comments.replies._id': req.params.id }, { $set: { 'comments.$.replies.$[reply].text': req.body.reply } }, { arrayFilters: [{ 'reply._id': req.params.id }] });
    res.redirect('/feed');
};

exports.deleteReply = async (req, res) => {
    await Posts.updateOne({}, { $pull: { 'comments.$[].replies': { _id: req.params.id } } });
    res.redirect('/feed');
};

exports.addReplyToReply = async (req, res) => {
    const post = await Posts.findById(req.params.postId);
    if (post) {
        const comment = post.comments.id(req.params.commentId);
        if (comment) {
            const reply = comment.replies.id(req.params.replyId);
            if (reply) {
                comment.replies.push({ text: req.body.text });
                await post.save();
                res.json({ success: true, message: "Reply added successfully" });
            } else {
                res.status(404).json({ success: false, message: "Reply not found" });
            }
        } else {
            res.status(404).json({ success: false, message: "Comment not found" });
        }
    } else {
        res.status(404).json({ success: false, message: "Post not found" });
    }
};