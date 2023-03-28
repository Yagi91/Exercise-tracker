const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const { main, createUser, logs, User } = require("./models.js");

//status codes
//200 - OK
//201 - Created
//400 - Bad Request
//404 - Not Found
//500 - Internal Server Error

// Basic Configuration
main(); //connect to db
logs();
app.use(cors()); //To prevent cross-origin errors
app.use(express.static("public")); //To serve static assets
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
}); // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })); // parse application/json
app.use(bodyParser.json());

// Your first API endpoint
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});
app
  .route("/api/users")
  .post(async (req, res) => {
    const userName = req.body.username;
    try {
      const newUser = await createUser(userName);
      const id = newUser._id.toString();
      res.status(200).json({ username: newUser.username, _id: id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err });
    }
  })
  .get(async (req, res) => {
    try {
      const users = await User.find();
      res.status(201).json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err });
    }
  });

// app.route("/api/users/:_id/exercises").post(async (req, res) => {

// });

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
