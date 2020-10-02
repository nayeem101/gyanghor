const { Schema, model } = require("mongoose");

const DeptSchema = new Schema({
  name: String,
  shortName: String,
});

module.exports = model("Department", DeptSchema);
