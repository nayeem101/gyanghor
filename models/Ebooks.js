const { Schema, model } = require("mongoose");

const mongoosePaginate = require("mongoose-paginate");

const EbookSchema = new Schema({
  category: Array,
  semester: { type: String, required: true },
  name: {
    type: String,
    trim: true,
  },
  writer: {
    type: String,
    trim: true,
  },
  pages: Number,
  publisher: {
    type: String,
    trim: true,
  },
  language: String,
  link: String,
  dlink: String,
  details: {
    type: String,
    trim: true,
  },
});

EbookSchema.index({ name: "text" });

EbookSchema.plugin(mongoosePaginate);

const ebookModel = model("ebooks", EbookSchema);

module.exports = ebookModel;
