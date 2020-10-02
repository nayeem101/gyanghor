const { Schema, model } = require("mongoose");

const AdminSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = model("admins", AdminSchema);
