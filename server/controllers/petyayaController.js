require('dotenv').config();
const mongoose = require('mongoose');
const Posts = require('../../models/posts');
const axios = require('axios');
const cloudinary = require("../config/cloudinary");


const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Database connected");
});

exports.index = async (req, res) => {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search?limit=5');
        const catImages = response.data; // Get images from API
        res.render('index', { catImages }); // Pass images to EJS
    } catch (error) {
        console.error("Error fetching cat images:", error);
        res.render('index', { catImages: [] }); // Pass empty array if there's an error
    }
};

exports.posts = async (req, res) => {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search?limit=5');
        const catImages = response.data; // Fetch cat images
        const posts = await Posts.find({}).sort({ createdAt: -1 });
        res.render('home', { posts, catImages }); // Pass catImages to home.ejs
    } catch (error) {
        console.error("Error fetching cat images:", error);
        res.render('home', { posts, catImages: [] }); // Handle errors
    }
};

exports.addPost = async (req, res) => {
    const post = new Posts(req.body.post);
    await post.save();
    res.redirect('/dashboard');
};

exports.editPost = async (req, res) => {
    const post = await Posts.findByIdAndUpdate(req.params.id, { content: req.body.post.content }, { new: true });
    res.redirect('/dashboard');
};

exports.deletePost = async (req, res) => {
    await Posts.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
};

exports.uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No file uploaded." });
    }

    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "pet-yaya",  // Ensure this matches Cloudinary storage settings
        });

        res.status(200).send({ message: "Upload successful", imageUrl: result.secure_url });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).send({ message: "Upload failed", error });
    }
};