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

const logsSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String, required: true },
});

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  description: { type: String },
  duration: { type: Number },
  date: { type: String },
  count: { type: Number, default: 0 },
  log: [logsSchema],
});

const User = mongoose.model("User", userSchema);

function logs() {}

const createUser = async (username) => {
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      console.error("User already exists");
      return user;
    }
    const newUser = new User({ username: username });
    const savedUser = await newUser.save();
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
    if (!date || !description || !duration) {
      console.error(
        "Please fill in at least the _id, description and duration"
      );
      throw new Error(
        "Please fill in at least the _id, description and duration"
      );
    }
    let newDate = new Date(date).toDateString();
    let _user = await User.findById(id);
    if (!_user) {
      console.error("User does not exist");
      throw new Error("User does not exist");
    }
    _user.count = _user.count + 1;
    _user.log.push({ description, duration, date: newDate });
    const savedUser = await _user.save();
    return {
      user: savedUser.username,
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
    if (from && to && limit) {
      _user.log = _user.log
        .filter((log) => log.date >= from && log.date <= to)
        .slice(0, limit);
    }
    console.log("users logs filtered", _user.log);
    return _user;
  } catch (err) {
    console.error(err);
    return err;
  }
};

module.exports = {
  User,
  main,
  createUser,
  logs,
  addExercise,
  getLogs,
};
