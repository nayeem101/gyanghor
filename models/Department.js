const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const DeptSchema = new Schema({
  name: String,
  shortName: String,
});

DeptSchema.plugin(mongoosePaginate);

module.exports = model("Department", DeptSchema);
