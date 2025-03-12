const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for comments
const commentSchema = new Schema({
    text: { type: String, required: true }, // The comment text, required field
    createdAt: { type: Date, default: Date.now } // Timestamp of when the comment was created
});

// Define the schema for posts
const postSchema = new Schema({
    content: { type: String, required: true }, // The main content of the post, required field
    createdAt: { type: Date, default: Date.now }, // Timestamp of when the post was created
    likes: { type: Number, default: 0 }, // Like counter, initialized to 0
    comments: [commentSchema] // An array of comments associated with the post
});

// Export the post model
module.exports = mongoose.model('post', postSchema);