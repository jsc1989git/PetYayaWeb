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
        post.comments.push({ text: req.body.comment }); // Add new comment to post
        await post.save(); // Save updated post
        res.redirect('/feed');
    } catch (error) {
        console.error('Error adding comment:', error);
        res.redirect('/feed');
    }
};