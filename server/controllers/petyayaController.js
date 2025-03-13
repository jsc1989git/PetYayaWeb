require('dotenv').config();
const mongoose = require('mongoose');
const Posts = require('../../models/posts');
const axios = require('axios');

const mongoURI = process.env.MONGODB_URI;
const gMapAPIKey = process.env.GOOGLE_MAP_API_KEY;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
});

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
    await new Posts(req.body.post).save();
    res.redirect('/feed');
};

exports.editPost = async (req, res) => {
    await Posts.findByIdAndUpdate(req.params.id, { content: req.body.post.content }, { new: true });
    res.redirect('/feed');
};

exports.deletePost = async (req, res) => {
    await Posts.findByIdAndDelete(req.params.id);
    res.redirect('/feed');
};

exports.likePost = async (req, res) => {
    const post = await Posts.findById(req.params.id);
    if (post) {
        post.likes += 1;
        await post.save();
        res.json({ likes: post.likes });
    } else {
        res.status(404).json({ error: 'Post not found' });
    }
};

// CRUD Operations for Comments
exports.addComment = async (req, res) => {
    const post = await Posts.findById(req.params.id);
    if (post) {
        post.comments.push({ text: req.body.comment, likes: 0, replies: [] });
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
    const post = await Posts.findOne({ 'comments._id': req.params.commentId });
    if (post) {
        post.comments.id(req.params.commentId).remove();
        await post.save();
        res.redirect('/feed');
    } else {
        res.status(404).json({ error: 'Comment not found' });
    }
};

exports.likeComment = async (req, res) => {
    const post = await Posts.findOne({ 'comments._id': req.params.commentId });
    if (post) {
        post.comments.id(req.params.commentId).likes += 1;
        await post.save();
        res.json({ likes: post.comments.id(req.params.commentId).likes });
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
    const post = await Posts.findOne({ 'comments.replies._id': req.params.id });
    if (post) {
        const reply = post.comments.find(c => c.replies.id(req.params.id)).replies.id(req.params.id);
        reply.likes += 1;
        await post.save();
        res.json({ likes: reply.likes });
    } else {
        res.status(404).json({ error: 'Reply not found' });
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