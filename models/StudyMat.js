const { Schema, model } = require("mongoose");

const StudySchema = new Schema({
  category: { type: Array, required: true },
  weblinks: [{ title: String, link: String }],
  subjects: [
    {
      subname: String,
      videolink: { title: String, link: String, total: Number},
    },
  ],
});

module.exports = model("studymats", StudySchema);
