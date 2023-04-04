const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const {
  main,
  createUser,
  logs,
  User,
  addExercise,
  getLogs,
} = require("./models.js");

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

const validDateFormat = /^\d{4}-\d{2}-\d{2}$/; //date format YYYY-MM-DD

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

app.route("/api/users/:_id/exercises").post(async (req, res) => {
  const description = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date || new Date().toDateString();
  const id = req.params._id;

  const durationsIsNumber = !isNaN(duration);
  const dateIsValid = new Date(date).toString() !== "Invalid Date";
  const dateFormatIsValid = validDateFormat.test(date);
  console.log(dateIsValid, date);

  if (!description)
    return res.status(400).json({ error: "Description is required" });
  if (!duration && !durationsIsNumber)
    return res.status(400).json({ error: "Duration is required" });
  if (id.length !== 24) return res.status(400).json({ error: "Invalid ID" });
  if (!dateIsValid && !dateFormatIsValid)
    return res.status(400).json({ error: "Invalid Date Format" });

  try {
    const newDate = new Date(date).toDateString();
    const newExercise = await addExercise(id, description, duration, newDate);
    res.status(201).json(newExercise);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: err });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  console.log("Entered logs");
  const id = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit || 0;
  if (id.length !== 24) return res.status(400).json({ error: "Invalid ID" });
  try {
    console.log("Entered try");
    if (from || to || limit) {
      console.log("Entered if");
      if (
        (!validDateFormat.test(from) && from) ||
        (!validDateFormat.test(to) && to) ||
        isNaN(limit)
      ) {
        console.log("Entered if if");
        return res.status(400).json({ error: "Invalid Query" });
      }
      console.log("index.js", from, to, limit);
      const logs = await getLogs(id, from, to, limit);
      return res.status(200).json(logs);
    }
    const logs = await getLogs(id);
    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: err });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
