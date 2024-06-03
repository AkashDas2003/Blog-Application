const mongoose = require("mongoose");

// Define Post schema
const postSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Capitalized "User"
  date: {
    type: Date,
    default: Date.now,
  },
  content: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Capitalized "User"
});

// Define and export Post model with PascalCase
module.exports = mongoose.model("Post", postSchema); // PascalCase "Post"
