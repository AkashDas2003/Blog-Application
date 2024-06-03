const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/miniproject");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  profilepic: {
    type: String,
    default: "profile.jpeg",
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // Reference name updated to "Post"
});

module.exports = mongoose.model("User", userSchema); // Model name changed to PascalCase "User"
