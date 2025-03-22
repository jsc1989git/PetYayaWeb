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
        const response = await axios.get('https://api.thecatapi.com/v1/images/search');
        const posts = await Posts.find({})
            .populate('author', 'name avatar')
            .populate({
                path: "comments.author", // Populate comment author
                select: "name avatar"
            })
            .populate({
                path: "comments.replies.author", // Populate reply author
                select: "name avatar"
            })
            .sort({ createdAt: -1 });
        res.render('home', { posts, user: req.user, catImages: response.data, googleMapsApiKey: gMapAPIKey });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.render('home', { posts: [], catImages: [] });
    }
};

//Fetch owner posts and render the profile page
exports.profile = async (req, res) => {
    try {
        const posts = await Posts.find({ author: req.user.id }).sort({ createdAt: -1 });
        res.render('profile', { posts, googleMapsApiKey: gMapAPIKey });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.render('profile', { posts: [] });
    }
};

// Fetch all posts and render the feed page
exports.admin = async (req, res) => {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search');
        const posts = await Posts.find({})
            .populate('author', 'name avatar')
            .populate({
                path: "comments.author", // Populate comment author
                select: "name avatar"
            })
            .populate({
                path: "comments.replies.author", // Populate reply author
                select: "name avatar"
            })
            .sort({ createdAt: -1 });
        res.render('admin', { posts, catImages: response.data, googleMapsApiKey: gMapAPIKey });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.render('admin', { posts: [], catImages: [] });
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

exports.addPostProfile = async (req, res) => {
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
        res.redirect("/profile");
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
        const userId = req.user.id;
        const post = await Posts.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const userIdStr = userId.toString();
        const hasLiked = post.likes.some(id => id.toString() === userIdStr);  

        if (hasLiked) {
            // Unlike: Remove userId from likes array
            post.likes = post.likes.filter(id => id.toString() !== userIdStr);
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
    try {
        const post = await Posts.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const { text } = req.body; // Get comment text from request body

        if (!text) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        post.comments.push({ 
            text,
            likes: [],
            author: req.user.id,
            replies: [] 
        });

        await post.save();
        res.redirect('/feed');
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.editComment = async (req, res) => {
    try {
        const post = await Posts.findOneAndUpdate(
            { 'comments._id': req.params.id }
        )

        if (!post) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const comment = post.comments.id(req.params.id);
        const userIdStr = req.user.id.toString();

        const alreadyLiked = comment.likes.some(id => id.toString() === userIdStr);

        if (alreadyLiked) {
            comment.likes = comment.likes.filter(id => id.toString() !== userIdStr);
        } else {
            comment.likes.push(req.user.id);
        }

        await post.save();
        res.json({ likes: comment.likes.length });
    } catch (error) {
        console.error("Error liking comment:", error);
        res.status(500).json({ error: 'Internal server error' });
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
    try {
        const post = await Posts.findOne({ 'comments._id': req.params.commentId });

        if (!post) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const comment = post.comments.id(req.params.commentId);
        const userIdStr = req.user.id.toString();

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const alreadyLiked = comment.likes.some(id => id.toString() === userIdStr);

        if (alreadyLiked) {
            comment.likes = comment.likes.filter(id => id.toString() !== userIdStr);
        } else {
            comment.likes.push(req.user.id);
        }

        await post.save();
        res.json({ likes: comment.likes.length });
    } catch (error) {
        console.error("Error liking comment:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// CRUD Operations for Replies
exports.addReplyToComment = async (req, res) => {
    try {
        const post = await Posts.findOne({'comments._id': req.params.commentId});

        if (!post) {
            return res.status(404).json({ error: 'Post containing this comment not found' });
        }

        const comment = post.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const { text } = req.body; // Get reply text from request body

        if (!text) {
            return res.status(400).json({ error: 'Reply text is required' });
        }

        comment.replies.push({
            text,
            likes: [],
            author: req.user.id
        });

        await post.save();
        res.redirect('/feed');
    } catch (error) {
        console.error("Error adding reply:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.likeReply = async (req, res) => {
    try {
        const post = await Posts.findOne({ 'comments.replies._id': req.params.replyId });

        if (!post) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        const comment = post.comments.find(comment =>
            comment.replies.some(reply => reply._id.toString() === req.params.replyId
        ));

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const reply = comment.replies.id(req.params.replyId);
        const userIdStr = req.user.id.toString();

        const alreadyLiked = reply.likes.some(id => id.toString() === userIdStr);

        if (alreadyLiked) {
            reply.likes = reply.likes.filter(id => id.toString() !== userIdStr);
        } else {
            reply.likes.push(req.user.id);
        }

        await post.save();
        res.json({ likes: reply.likes.length });

    } catch (error) {
        console.error("Error liking reply:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.editReply = async (req, res) => {
    try {
        const post = await Posts.findOneAndUpdate(
            { 'comments.replies._id': req.params.id }
        );

        if (!post) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        const comment = post.comments.find(comment =>
            comment.replies.some(reply => reply._id.toString() === req.params.id)
        );

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const reply = comment.replies.id(req.params.id);
        reply.text = req.body.text;

        await post.save();
        res.redirect('/feed');
    } catch (error) {
        console.error("Error editing reply:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteReply = async (req, res) => {
    try {
        const post = await Posts.findOneAndUpdate({
            'comments.replies._id': req.params.replyId
        })

        if (!post) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        const comment = post.comments.find(comment =>
            comment.replies.some(reply => reply._id.toString() === req.params.replyId)
        );

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comment.replies = comment.replies.filter(reply =>
            reply._id.toString() !== req.params.replyId
        );

        await post.save();
        res.redirect('/feed');
    } catch (error) {
        console.error("Error deleting reply:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
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