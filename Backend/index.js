const express =require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const HttpError =require('./Utils/HttpError');
const cloudinary = require('cloudinary').v2;
const fs = require("fs");
require('dotenv').config();
require('./Models/Course');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const app = express();
const MONGO_URI=process.env.MONGO_URI
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(bodyParser.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose
.connect(MONGO_URI)
.then(async () => {
    console.log("Connected to database");
    // Automatically seed courses if collection is empty
    const Course = require("./Models/Course");
    const count = await Course.countDocuments();
    if (count === 0) {
      const coursesFilePath = path.join(__dirname, "Data", "courses.json");
      fs.readFile(coursesFilePath, "utf8", async (err, data) => {
        if (err) {
          console.error("Error reading courses file:", err);
        } else {
          try {
            const courses = JSON.parse(data);
            await Course.insertMany(courses);
            console.log("Courses seeded from courses.json");
          } catch (parseErr) {
            console.error("Error parsing courses JSON:", parseErr);
          }
        }
      });
    }
  })
  .catch((error) => console.log(error));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader( 'Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE ,PUT')
    next();
});

const UserRoutes = require( "./Routes/UserRoutes");
const PaymentRoutes = require ( "./Routes/PaymentRoutes");
const QuestionRoutes = require ( "./Routes/QuestionRoutes");
const CourseRoutes = require("./Routes/CourseRoutes");
app.use("/api", UserRoutes);
app.use("/api", QuestionRoutes);
app.use("/api", PaymentRoutes);
app.use("/api", CourseRoutes);


app.use((req, res, next) => next (new HttpError('Could not find this route.', 404)));

app.use((error, req, res, next) => {
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
});


app.listen(8000 ,()=> console.log("listening to port 8000"));