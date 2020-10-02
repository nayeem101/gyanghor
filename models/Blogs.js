const { Schema, model } = require("mongoose");

const mongoosePaginate = require("mongoose-paginate");

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: { type: Array, required: true },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: { authorID: String, author: String },
  createdAt: Date,
  details: {
    type: String,
    required: true,
  },
  view: Number,
});

blogSchema.plugin(mongoosePaginate);

module.exports = model("Blogs", blogSchema);
