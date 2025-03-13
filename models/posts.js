const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
    text: { type: String, required: true },
    likes: { type: Number, default: 0 }
}, { timestamps: true });

const CommentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    likes: { type: Number, default: 0 },
    replies: [ReplySchema] // Embed replies inside comments
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: [CommentSchema] // Embed comments inside posts
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);