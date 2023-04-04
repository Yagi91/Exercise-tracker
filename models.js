const mongoose = require("mongoose");
require("dotenv").config();

const Schema = mongoose.Schema;

// main();
async function main() {
  try {
    //connect to db
    await mongoose.connect(process.env.MONGO_URI, {
      //
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err);
  }
}

//create schema
const logsSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String, required: true },
});

//create model
const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  description: { type: String },
  duration: { type: Number },
  date: { type: String },
  count: { type: Number, default: 0 },
  log: [logsSchema], //{ type: Array, default: [] },
});

const User = mongoose.model("User", userSchema);

// function logs() {}

//create new user
const createUser = async (username) => {
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      console.error("User already exists");
      return user;
    }
    const newUser = new User({ username: username });
    const savedUser = await newUser.save(); //save to db
    console.log("New user created", savedUser);
    return savedUser;
  } catch (err) {
    console.error(
      "Could not save to the new user to the database, because of the following error " +
        err
    );
    return err;
  }
};

const addExercise = async (id, description, duration, date) => {
  try {
    //check if all required fields are filled
    if (!date || !description || !duration) {
      console.error(
        "Please fill in at least the _id, description and duration"
      );
      throw new Error(
        "Please fill in at least the _id, description and duration"
      );
    }
    let newDate = new Date(date).toDateString(); //date format example: "Mon Jan 01 2001"

    let _user = await User.findById(id);
    if (!_user) {
      console.error("User does not exist");
      throw new Error("User does not exist");
    }
    _user.count = _user.count + 1;
    _user.log.push({ description, duration, date: newDate }); //Add new exercise to the log
    const savedUser = await _user.save();
    return {
      username: savedUser.username,
      description,
      duration: Number(duration),
      date: newDate,
      _id: savedUser._id,
    };
  } catch (err) {
    console.error(
      "Could not save to the new user to the database, because of the following error " +
        err
    );
    return err;
  }
};

const getLogs = async (id, from, to, limit) => {
  try {
    const _user = await User.findById(id);
    if (!_user) {
      console.error("User does not exist");
      throw new Error("User does not exist");
    }
    if (!from && !to && !limit) return _user;

    let fromDate = new Date(from);
    let toDate = new Date(to);

    let filteredLogs = _user.log; //Initialize the filtered logs to the user's logs

    if (fromDate != "Invalid Date" || toDate != "Invalid Date") {
      //Check if any of the dates are valid
      if (!fromDate) {
        fromDate = new Date(0); //If the from date is not valid, set it to the beginning of time
      }
      if (!toDate) {
        toDate = new Date(); //If the to date is not valid, set it to the current date
      }

      //Update the filtered logs to only include logs between the from and to dates
      filteredLogs = _user.log.filter((log) => {
        let logDate = new Date(log.date);
        return logDate >= fromDate && logDate <= toDate;
      });
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(0, limit); //limit the number of logs
    }
    //return the filtered logs
    return {
      _id: _user._id,
      username: _user.username,
      count: filteredLogs.length, //make the count equal to the number of filtered logs
      log: filteredLogs,
    };
  } catch (err) {
    console.error(err);
    return err;
  }
};

module.exports = {
  User,
  main,
  createUser,
  addExercise,
  getLogs,
};
