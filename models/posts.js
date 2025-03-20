const mongoose = require("mongoose");

// Schema for replies
const ReplySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    likes: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User ID of the reply author
  },
  { timestamps: true }
);

// Schema for comments (including embedded replies)
const CommentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs who liked the comment
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User ID of the comment author
    replies: [ReplySchema], // Nested replies inside comments
  },
  { timestamps: true }
);

// Schema for posts (including embedded comments)
const PostSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs who liked the post
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User ID of the post author
    comments: [CommentSchema], // Nested comments inside posts
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);