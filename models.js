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
    console.log(newDate);
    let _user = await User.findById(id);
    if (!_user) {
      console.error("User does not exist");
      throw new Error("User does not exist");
    }
    _user.count = _user.count + 1;
    _user.log.push({ description, duration, date: newDate });
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
    if (from || to || limit) {
      console.log("limit exists", limit);
      const fromDate = from ? new Date(from) : new Date(0);
      const toDate = to ? Date(to) : new Date();
      const numLimit = limit ? Number(limit) : 10000;
      console.log("queried", fromDate, toDate, limit);
      const user = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $project: {
            username: 1,
            count: 1,
            //filter the log
            log: {
              $filter: {
                input: "$log",
                as: "log",
                // limit: numLimit,
                cond: {
                  $and: [
                    {
                      $gte: [
                        { $dateFromString: { dateString: "$$log.date" } },
                        fromDate,
                      ],
                    },
                    {
                      $lte: [
                        { $dateFromString: { dateString: "$$log.date" } },
                        toDate,
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            username: 1,
            count: 1,
            //limit the log
            log: { $slice: ["$log", numLimit] },
          },
        },
        {
          $project: {
            username: 1,
            count: 1,
            //remove the _id from the log
            log: {
              $map: {
                input: "$log",
                as: "log",
                in: {
                  description: "$$log.description",
                  duration: "$$log.duration",
                  date: "$$log.date",
                },
              },
            },
          },
        },
      ]);
      console.log("user", user);
      return user[0];
    }
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
