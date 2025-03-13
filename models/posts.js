const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    likes: { type: Number, default: 0 },
    replies: [{ text: String, likes: Number }]
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: [CommentSchema] // Embedding comments inside post
}, { timestamps: true });

module.exports = mongoose.model("Posts", PostSchema);