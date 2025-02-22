require('dotenv').config();
const mongoose = require('mongoose');
const Posts = require('../../models/posts')

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Database connected");
})

exports.index = async(req, res) => {
    res.render('index')
}

exports.posts = async(req, res) => {
    const posts = await Posts.find({}).sort({ createdAt: -1 });
    res.render('home', { posts });
}

exports.addPost = async(req, res) => {
    const post = new Posts(req.body.post);
    await post.save();
    res.redirect('/dashboard')
}

exports.editPost = async(req, res) => {
    const post = await Posts.findByIdAndUpdate(req.params.id, { content: req.body.post.content }, { new: true });
    res.redirect('/dashboard');
}

exports.deletePost = async (req, res) => {
    const post = await Posts.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
}

