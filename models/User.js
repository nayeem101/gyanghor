const validator = require("validator");
const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    trim: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: "Invalid Email Address",
    },
  },
  mobile: {
    type: String,
    trim: true,
    validate: {
      validator: (value) => validator.isMobilePhone(value, "bn-BD"),
      message: "Invalid Mobile Number",
    },
  },
  department: String,
  session: String,
  batch: String,
  password: String,
});

const UserModel = model("Users", UserSchema);
module.exports = UserModel;
