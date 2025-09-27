const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Credit: {
    type: Number,
    required: true,
    default: 100,
  },
  RefCode:{
    type: String,
    required: true,
  },
  Notification: [
    {
      Message: {
        type: String,
        required: true,
      },
      IsRead: {
        type: Boolean,
        default: false,
      },
      CreatedAt: {
        type: Date,
        default: Date.now,
      },
      paperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Paper",
      },
    },
  ],
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  ],
  browsedCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  unlockedAnswers: [
    {
      paperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Paper",
        required: true,
      },
      questionIndexes: {
        type: [Number],
        required: true,
        default: [],
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
