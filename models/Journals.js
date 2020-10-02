const { Schema, model } = require("mongoose");

const mongoosePaginate = require("mongoose-paginate");

const journalSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  author: { type: String, required: true },
  authorBatch: { type: String, required: true },
  image: { type: String },
  occupation: { type: String, required: true },
  journalName: { type: String, required: true },
  journalLink: { type: String, required: true },
  publishedAt: { type: Date, required: true },
  socialLinks: [{ media: String, link: String }],
});

journalSchema.plugin(mongoosePaginate);

module.exports = model("Journals", journalSchema);
