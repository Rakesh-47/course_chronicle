const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  Question: {
    type: String,
    required: true,
  },
  Answer: {
    type: String,
    required: true,
  },
  Tag: {
    type: String,
    required: true,
  },
  Title: {
    type: String,
    required: true,
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
  PaperFile: {
    type: String, // URL or path to the uploaded file
    required: true,
  },
});

module.exports = mongoose.model("Question", QuestionSchema);
