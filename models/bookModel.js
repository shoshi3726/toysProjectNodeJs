
const mongoose = require('mongoose');
const Joi = require('joi')

const booksSchema = new mongoose.Schema({
  name: String,
  category: String,
  author: String,
  info: String,
  price: Number,
  image: String,
  user_id: String,
  date_created: {
    type: Date, default: Date.now()
  }
})

exports.BooksModel = mongoose.model("books", booksSchema);

exports.validateBook = (_reqBody) => {
  let schemaJoi = Joi.object({
    name: Joi.string().min(1).max(99).required(),
    category: Joi.string().min(1).max(50).required(),
    author: Joi.string().min(1).max(50).required(),
    info: Joi.string().min(1).max(99).required(),
    price: Joi.number().min(1).max(9999).required(),
    image: Joi.string().min(2).max(500).allow(null, "")
  })
  return schemaJoi.validate(_reqBody);
}
