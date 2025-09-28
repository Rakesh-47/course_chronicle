const express = require("express");
const router = express.Router();
const Course = require("../Models/Course");

router.get("/courses", async (req, res, next) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Error fetching courses" });
  }
});

module.exports = router;