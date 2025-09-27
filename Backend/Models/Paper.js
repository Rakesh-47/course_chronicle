const mongoose = require("mongoose");

const QuestionSubSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
  },
  embedding: {
    type: [Number], // Array of numbers as the vector
  },
});

const PaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  filePath: {
    type: String, // Path to the uploaded file (image or PDF)
    required: true,
  },
  questions: [QuestionSubSchema],
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  session: {
    type: String,
    enum: ["Winter", "Summer", "Monsoon"],
    required: true,
  },
  sessionYear: {
    type: String,
    required: true,
  },
  examType: {
    type: String,
    enum: ["Midsem", "Endsem", "Quiz", "Assignment"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Paper", PaperSchema, "papers");