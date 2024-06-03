const express = require("express");
const app = express();
const path = require("path");
const userModel = require("./models/user");
const postModel = require("./models/post");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const { log } = require("console");
const { renameSync } = require("fs");
const post = require("./models/post");
const crypto = require("crypto");
const multer = require("multer");
const { upload } = require("./config/multerconfig");
app.set("view engine", "ejs");
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Routes
app.get("/home", (req, res) => {
  res.render("index");
});

app.get("/upload", (req, res) => {
  res.render("profileupload");
  //   console.log("hey");
});

app.post("/upload", isLoggedIn, upload.single("image"), async (req, res) => {
  // Find the user by email
  let user = await userModel.findOne({ email: req.user.email });
  // Update user's profilepic with the filename of the uploaded file
  user.profilepic = req.file.filename;
  // Save the updated user object
  await user.save();
  // Redirect to the profile page
  res.redirect("/profile");
});


//login route
app.get("/login", (req, res) => {
  res.render("login");
  //   console.log("hey");
});

//profile page
app.get("/profile", isLoggedIn, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");
  res.render("profile", { user });
});

//like feature
app.get("/like/:id", isLoggedIn, async (req, res) => {
  // Find the post by ID
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }

  await post.save();
  res.redirect("/profile");
});

// edit feature
app.get("/edit/:id", isLoggedIn, async (req, res) => {
  // Find the post by ID
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  res.render("edit", { post });
});
//update feature
app.post("/update/:id", isLoggedIn, async (req, res) => {
  // Find the post by ID
  let post = await postModel.findOneAndUpdate(
    { _id: req.params.id },
    { content: req.body.content }
  );
  res.redirect("/profile");
});

//create post
app.post("/post", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let { content } = req.body;
  let post = await postModel.create({
    user: user._id,
    content,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

// render register page
app.get("/index", (req, res) => {
  res.render("index"); // Assuming index.ejs is in your views folder
});
//register page
app.post("/register", async (req, res) => {
  let { email, password, username, name, age } = req.body;
  let user = await userModel.findOne({ email });
  if (user) return res.status(500).send("User Already registered");
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      // Changed from salt to hash
      let user = await userModel.create({
        email,
        username,
        name,
        age,
        password: hash,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "shhhhh");
      res.cookie("token", token);
      res.send("Registered!!!!!!");
    });
  });
});

//login page
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found"); // Send a more specific message
    }

    // Use async/await with bcrypt.compare() for cleaner code
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      let token = jwt.sign({ email: email, userid: user._id }, "shhhhh");
      res.cookie("token", token);
      res.status(200).redirect("profile"); // Return success message
    } else {
      return res.status(401).send("Invalid password"); // Send a more specific message
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

//logout
app.get("/logout", (req, res) => {
  res.cookie("token", ""); // Remove the cookie named "token"
  res.redirect("/login"); //moves to home or register page
});

//checks whether the user is logged in or not
function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") {
    res.send("you must be logged in!!!");
  } else {
    try {
      let data = jwt.verify(req.cookies.token, "shhhhh");
      req.user = data; // Corrected assignment to req.user
    } catch (error) {
      console.error(error);
      return res.status(401).send("Invalid token");
    }
    next();
  }
}

// Start the server
app.listen(3000);
