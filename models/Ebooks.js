const { Schema, model } = require("mongoose");

const mongoosePaginate = require("mongoose-paginate");

const EbookSchema = new Schema({
  category: Array,
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
  dlink:String,
  details: {
    type: String,
    trim: true,
  },
});

EbookSchema.plugin(mongoosePaginate);

module.exports = model("ebooks", EbookSchema);
