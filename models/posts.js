const mongoose = require("mongoose");

// Schema for replies
const ReplySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    likes: [{ type: String }],
  },
  { timestamps: true }
);

// Schema for comments (including embedded replies)
const CommentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    likes: [{ type: String }],
    replies: [ReplySchema], // Nested replies inside comments
  },
  { timestamps: true }
);

// Schema for posts (including embedded comments)
const PostSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    likes: [{ type: String }],
    comments: [CommentSchema], // Nested comments inside posts
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);