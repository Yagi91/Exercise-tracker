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

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  description: { type: String },
  duration: { type: Number },
  date: { type: String },
});

const User = mongoose.model("User", userSchema);

function logs() {}

const CreateUser = async (username) => {
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      console.err("User already exists");
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

module.exports = {
  main,
  CreateUser,
  logs,
};
