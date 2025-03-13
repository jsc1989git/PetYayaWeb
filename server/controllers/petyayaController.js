require('dotenv').config();
const mongoose = require('mongoose');
const Posts = require('../../models/posts');
const axios = require('axios');

// Load environment variables
const mongoURI = process.env.MONGODB_URI;
const gMapAPIKey = process.env.GOOGLE_MAP_API_KEY;

// Connect to MongoDB database
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Timeout for server selection
});

const db = mongoose.connection;

// Handle database connection errors
db.on('error', console.error.bind(console, 'connection error:'));
// Log successful database connection
db.once('open', () => {
    console.log("Database connected");
});

// Render the homepage with cat images
exports.index = async (req, res) => {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search?limit=5');
        const catImages = response.data; // Fetch random cat images
        res.render('index', { catImages }); // Pass images to the view
    } catch (error) {
        console.error("Error fetching cat images:", error);
        res.render('index', { catImages: [] }); // Render with empty images if error occurs
    }
};

// Fetch all posts and render the feed page
exports.posts = async (req, res) => {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search?limit=5');
        const catImages = response.data; // Fetch cat images
        const posts = await Posts.find({}).sort({ createdAt: -1 }); // Fetch posts, sorted by newest first
        res.render('home', { posts, catImages, googleMapsApiKey: gMapAPIKey });
    } catch (error) {
        console.error("Error fetching cat images:", error);
        res.render('home', { posts: [], catImages: [] });
    }
};

// Add a new post to the database
exports.addPost = async (req, res) => {
    const post = new Posts(req.body.post); // Create a new post instance
    await post.save(); // Save the post to the database
    res.redirect('/feed'); // Redirect back to the feed
};

// Edit an existing post
exports.editPost = async (req, res) => {
    await Posts.findByIdAndUpdate(req.params.id, { content: req.body.post.content }, { new: true });
    res.redirect('/feed');
};

// Delete a post
exports.deletePost = async (req, res) => {
    await Posts.findByIdAndDelete(req.params.id);
    res.redirect('/feed');
};

// Like a post, incrementing the like counter
exports.likePost = async (req, res) => {
    const post = await Posts.findById(req.params.id);
    if (post) {
        post.likes += 1; // Increment like count
        await post.save();
        res.json({ likes: post.likes }); // Send updated like count as JSON response
    } else {
        res.status(404).json({ error: 'Post not found' }); // Handle post not found
    }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
    try {
        const post = await Posts.findById(req.params.id);
        if (!post) {
            return res.status(404).send("Post not found");
        }

        // Create a new comment object
        const newComment = {
            text: req.body.comment,
            likes: 0, 
            replies: []
        };

        post.comments.push(newComment); // Add comment to post
        await post.save(); // Save updated post with new comment

        res.redirect('/feed'); // Redirect back to the feed
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send("Server Error");
    }
};

// Edit a comment
exports.editComment = async (req, res) => {
    try {
        const post = await Posts.findOne({ 'comments._id': req.params.commentId });
        if (post) {
            const comment = post.comments.id(req.params.commentId);
            comment.text = req.body.comment;
            await post.save();
            res.redirect('/feed');
        } else {
            res.status(404).json({ error: 'Comment not found' });
        }
    } catch (error) {
        console.error('Error editing comment:', error);
        res.redirect('/feed');
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const post = await Posts.findOne({ 'comments._id': req.params.commentId });
        if (post) {
            post.comments.id(req.params.commentId).remove();
            await post.save();
            res.redirect('/feed');
        } else {
            res.status(404).json({ error: 'Comment not found' });
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.redirect('/feed');
    }
};

// Like a comment
exports.likeComment = async (req, res) => {
    try {
        const post = await Posts.findOne({ 'comments._id': req.params.commentId });
        if (post) {
            const comment = post.comments.id(req.params.commentId);
            comment.likes += 1;
            await post.save();
            res.json({ likes: comment.likes });
        } else {
            res.status(404).json({ error: 'Comment not found' });
        }
    } catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add a reply to a comment
exports.addReplyToComment = async (req, res) => {
    try {
        const { text } = req.body; // Extract text properly
        if (!text || text.trim() === "") {
            return res.status(400).json({ success: false, message: "Reply text cannot be empty" });
        }

        const postId = req.params.postId;
        const commentId = req.params.commentId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        // Push new reply
        comment.replies.push({ text });

        await post.save();
        res.json({ success: true, message: "Reply added successfully" });
    } catch (error) {
        console.error("Error adding reply:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Like a reply
exports.likeReply = async (req, res) => {
    const post = await Posts.findOne({ 'comments.replies._id': req.params.id });
    if (post) {
        const comment = post.comments.find(c => c.replies.id(req.params.id));
        const reply = comment.replies.id(req.params.id);
        reply.likes += 1;
        await post.save();
        res.json({ likes: reply.likes });
    } else {
        res.status(404).json({ error: 'Reply not found' });
    }
};

// Edit a reply
exports.editReply = async (req, res) => {
    await Posts.updateOne({ 'comments.replies._id': req.params.id }, { $set: { 'comments.$.replies.$[reply].text': req.body.reply } }, { arrayFilters: [{ 'reply._id': req.params.id }] });
    res.redirect('/feed');
};

// Delete a reply
exports.deleteReply = async (req, res) => {
    await Posts.updateOne({}, { $pull: { 'comments.$[].replies': { _id: req.params.id } } });
    res.redirect('/feed');
};

exports.addReplyToReply = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === "") {
            return res.status(400).json({ success: false, message: "Reply text cannot be empty" });
        }

        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const replyId = req.params.replyId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        const reply = comment.replies.id(replyId);
        if (!reply) {
            return res.status(404).json({ success: false, message: "Reply not found" });
        }

        // Push new reply inside the reply
        comment.replies.push({ text });

        await post.save();
        res.json({ success: true, message: "Reply added successfully" });
    } catch (error) {
        console.error("Error adding reply to reply:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};