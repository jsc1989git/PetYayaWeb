const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for replies
const replySchema = new Schema({
    text: { type: String, required: true }, // The reply text, required field
    createdAt: { type: Date, default: Date.now }, // Timestamp of when the reply was created
    likes: { type: Number, default: 0 } // Like counter for replies
});

// Define the schema for comments
const commentSchema = new Schema({
    text: { type: String, required: true }, // The comment text, required field
    createdAt: { type: Date, default: Date.now }, // Timestamp of when the comment was created
    likes: { type: Number, default: 0 }, // Like counter for comments
    replies: [replySchema] // An array of replies associated with the comment
});

// Define the schema for posts
const postSchema = new Schema({
    content: { type: String, required: true }, // The main content of the post, required field
    createdAt: { type: Date, default: Date.now }, // Timestamp of when the post was created
    likes: { type: Number, default: 0 }, // Like counter for posts
    comments: [commentSchema] // An array of comments associated with the post
});

// Export the post model
module.exports = mongoose.model('Post', postSchema);