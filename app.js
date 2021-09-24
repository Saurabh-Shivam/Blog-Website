require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
// const encrypt = require("mongoose-encryption");
const md5 = require("md5");


const homeStartingContent = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum., written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum,comes from a line in section 1.10.32.";
const aboutPageContent = "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of. The Extremes of Good and Evil) by Cicero";
const contactPageContent = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum., written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum,comes from a line in section 1.10.32.";

const app = express();

// console.log(process.env.API_KEY);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));
app.use('/public', express.static('public')); // for getting image

// let posts = [];

// CONNECTING WITH MONGODB(MONGOOSE)
mongoose.connect("mongodb://localhost:27017/blogDB", {
  useNewUrlParser: true
});

// CREATING MONGOOSE SCHEMA
const postSchema = {
  title: String,
  content: String
};

//CREATING MONGOOSE MODEL
const Post = mongoose.model("Post", postSchema);


// Creating new schema
const joinSchema = {
  firstName: String,
  lastName: String,
  Email: String
};

// Creating new model
const Join = mongoose.model("Join", joinSchema);


// CREATING MONGOOSE SCHEMA FOR AUTHENTICATION
// This is an object created from mongoose schema class
const userSchema = new mongoose.Schema({
  Username: String,
  Email: String,
  Password: String
});

// // Added encryption package to userSchema, defined secret which will be used to encrypt the password and 
// // added the field which we actually want to encrypt
// // const secret = "Thisisourlittlesecret.";
// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["Password"]
// });

// CREATING MONGOOSE MODEL FOR AUTHENTICATION
const User = mongoose.model("User", userSchema);


app.get('/', (req, res) => {

  //  Finding all the posts in the posts collection and render that in the home.ejs file
  Post.find({}, function (err, posts) {
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
    });

  })

  // res.render("home", {
  //   homeContent: homeStartingContent,
  //   posts: posts
  // });

  // console.log(posts);

});

app.get('/about', (req, res) => {

  res.render("about", {
    aboutContent: aboutPageContent
  });
});

app.get('/contact', (req, res) => {

  res.render("contact", {
    contactContent: contactPageContent
  });
});

app.get('/compose', (req, res) => {

  res.render("compose");
});

app.get('/register', (req, res) => {

  res.render("register");
});

app.post('/register', (req, res) => {

  const newUser = new User({
    Username: req.body.username,
    Email: req.body.email,
    // Turning the password into a hash function using md5
    Password: md5(req.body.password)
  });

  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render("compose");
    }
  });

});

app.get('/login', (req, res) => {

  res.render("login");
});

app.post('/login', (req, res) => {

  const lUsername = req.body.username;
  const lEmail = req.body.email;
  const lPassword = md5(req.body.password);

  User.findOne({
    Email: lEmail
  }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.Password === lPassword) {
          res.render("compose");
        }
      }
    }
  });

});


//When we click on the publish button
app.post('/compose', (req, res) => {

  // console.log(req.body.postTitle);
  // console.log(req.body.postBody);

  // //Created the javascript object
  // const post = {
  //   title: req.body.postTitle,
  //   content: req.body.postBody
  // };

  //  CREATING MONGOOSE DOCUMENT
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  // posts.push(post);

  // SAVING THE DOCUMENT TO THE DATABASE
  // Adding a callback to the save method to only redirect to the home page once save is complete with no errors
  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });

  // res.redirect("/");

});

app.get('/posts/:postId', (req, res) => {

  // Constant to store the postId parameter value
  const requestedPostId = req.params.postId;
  // Using this we  will be able to find the post with a matching id in the posts collection
  Post.findOne({
    _id: requestedPostId
  }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

  // // console.log(req.params.postName);
  // const requestedTitle = _.lowerCase(req.params.postName);

  // posts.forEach(function (post) {
  //   const storedTitle = _.lowerCase(post.title);

  //   if (storedTitle === requestedTitle) {
  //     // console.log("Match Found!!");
  //     res.render("post", {
  //       title: post.title,
  //       content: post.content
  //     });
  //   }
  // });

});

// app.post('/posts/:postId', (req, res) => {
//   const requestedPostId = req.params.postId;

// })

app.post('/contact', (req, res) => {

  // Creating new document
  const join = new Join({
    firstName: req.body.fName,
    lastName: req.body.lName,
    Email: req.body.email
  });

  // SAVING THE DOCUMENT TO THE DATABASE
  join.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });

})


app.listen(3000, function () {
  console.log("Server started on port 3000");
});