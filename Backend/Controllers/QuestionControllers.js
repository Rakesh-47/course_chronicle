const fs = require("fs");
const path = require("path");
const fetch = require('node-fetch'); // <-- Added for direct API calls
const HttpError = require("../Utils/HttpError");
const Question = require("../Models/Question");
const Paper = require("../Models/Paper");
const User = require("../Models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const coursesData = require("../Data/courses.json");
const Course = require("../Models/Course");
const promptTemplate = require("../Data/prompt.json");
const cloudinary = require('cloudinary').v2; // Added for Cloudinary

const GEMINI_KEY = process.env.GEMINI_KEY;
// Use the correct API URL with the proper key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
console.log(GEMINI_KEY ? "Gemini API key loaded" : "No Gemini API key found");

const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

async function getVectorEmbedding(text) {
    // Dummy implementation: return a fixed-length dummy vector
    return Array.from({ length: 10 }, () => Math.random());
}

function sanitizeJsonResponse(str) {
   // First remove all carriage returns and line feeds
   const noLines = str.replace(/[\r\n]+/g, '');

  // This regex finds any sequence of one or more backslashes
  // not followed by a valid escape character and
  // doubles the number of backslashes in that sequence.
  return noLines.replace(/(\\+)(?!["\\/bfnrtu])/g, (match, slashes) => slashes + slashes);
}

const UploadPaper = async (req, res, next) => {
  try { 
    console.log("User data from middleware:", req.userData);
    
    if (!req.file) {
      return next(new HttpError("No file uploaded.", 400));
    }
    
    const user = await User.findById(req.userData.userId);
    if (!user) {
      return next(new HttpError("Authentication failed, user not found.", 404));
    }

    // Respond immediately to user that the file is being processed
    res.status(202).json({ message: "Paper submitted for review. You will be notified once processing is complete." });

    // --- Start processing in the background ---
    setImmediate(async () => {
      try {
        // Step 1: Upload the image to Cloudinary
        const cloudinaryResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "exam_papers" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        // Step 2: Process the uploaded image with Gemini API
        const image = req.file.buffer.toString("base64");
        const parts = [
          { text: JSON.stringify(promptTemplate, null, 2) },
          { inlineData: { mimeType: req.file.mimetype, data: image } },
        ];
          // =====================================================================================
          // LATER: Switch back to the official SDK method after setting up billing.
          // The SDK is more stable and is the recommended way for a production application.
          /*
          const result = await model.generateContent({
            contents: [{ parts }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2
            },
          });
          const jsonResponse = result.response.text();
          */
          // =====================================================================================


          // =====================================================================================
          // NOW: Using direct REST API call for testing without billing.
          // This uses a preview model and is not recommended for production.
          // =====================================================================================
          const apiResponse = await fetch(API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                  responseMimeType: "application/json",
                  temperature: 0.2
                },
              }),
          });

          if (!apiResponse.ok) {
              const errorBody = await apiResponse.text();
              throw new Error(`API call failed with status: ${apiResponse.status} - ${errorBody}`);
          }
          
          const result = await apiResponse.json();
          // The structure of the direct API response is different from the SDK
          const jsonResponse = result.candidates[0].content.parts[0].text;
          // =====================================================================================

          console.log("Gemini raw response:", jsonResponse);

          const safeJson = sanitizeJsonResponse(jsonResponse);
          const parsed = JSON.parse(safeJson);
          console.log("Parsed Gemini output:", parsed);

          if (parsed.course.code === "-1" || parsed.session.toString() === "-1") {
            console.error("Parsed output missing course information.");
            if (user) {
              user.Credit -= 10;
              user.Notification.push({
                Message: `Your paper [${req.body.title || req.file.originalname}] has been rejected as it could not be identified as a valid exam paper. Please try again.`
              });
              await user.save();
            }
            return;
          }

          const questionsWithEmbeddings = await Promise.all(
            parsed.questions.map(async (item) => {
              const vector = await getVectorEmbedding(`${item.question} ${item.answer}`);
              return {
                question: item.question,
                answer: item.answer,
                tag: item.tag,
                embedding: vector,
              };
            })
          );

          let courseObj = await Course.findOne({ code: parsed.course.code });
          console.log("Lookup by course code:", parsed.course.code, "=>", courseObj);
    
          if (!courseObj) {
            const nameRegex = new RegExp("^" + parsed.course.name, "i");
            courseObj = await Course.findOne({ name: { $regex: nameRegex } });
            console.log("Fallback lookup by course name regex:", parsed.course.name, "=>", courseObj);
            if (!courseObj) {
              console.error("No course found with the provided code or name.");
              if (user) {
                user.Credit -= 10;
                user.Notification.push({
                  Message: `Your paper [${req.body.title || req.file.originalname}] has been rejected as it could not be matched with a valid course. Please try again.`
                });
                await user.save();
              }
              return;
            }
          }
          
          const existingPaper = await Paper.findOne({
            course: courseObj._id,
            session: parsed.session,
            sessionYear: parsed.sessionYear,
            examType: parsed.examType,
          });
          if (existingPaper) {
            if (user) {
              user.Notification.push({
                Message: `Your paper [${req.body.title || req.file.originalname}] is already present in the database.`,
                paperId: existingPaper._id
              });
              await user.save();
            }
            return;
          }

          const paper = new Paper({
            title: req.body.title || req.file.originalname,
            filePath: cloudinaryResult.secure_url, 
            publicId: cloudinaryResult.public_id,
            course: courseObj._id,
            session: parsed.session,
            sessionYear: parsed.sessionYear,
            examType: parsed.examType,
            questions: questionsWithEmbeddings,
          });
          await paper.save();
          console.log("Paper updated successfully.");
          if (user) {
            user.Credit += 100;
            user.Notification.push({
              Message: `Your paper [${parsed.course.code}] ${parsed.course.name} (${parsed.examType}) has been approved!`,
              paperId: paper._id
            });
            await user.save();
          }
        } catch (err) {
          if (user) {
            user.Notification.push({
              Message: `Your paper [${req.body.title || req.file.originalname}] has been rejected due to error: ${err.message}. Please try again.`
            });
            await user.save();
          }
        }
      });
  } catch (error) {
    next(error);
  }
};

const GetQuestion = async (req, res, next) => {
  try {
    const data = await Question.find();
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(403);
    res.json({ Message: "Error occurred" });
  }
};

const GetPapers = async (req, res, next) => {
  try {
    const papers = await Paper.find().populate("course");
    const formattedPapers = papers.map((paper) => ({
      _id: paper._id,
      title: paper.title,
      course: paper.course,
      session: paper.session,
      sessionYear: paper.sessionYear,
      examType: paper.examType,
      createdAt: paper.createdAt,
      filePath: paper.filePath,
      questions: paper.questions,
    }));
    res.json(formattedPapers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    res.status(500).json({ message: "Error fetching papers" });
  }
};

const GetDashboard = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    const user = await User.findById(userId)
      .populate("enrolledCourses")
      .populate("browsedCourses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const enrolled = user.enrolledCourses.map((course) => course._id.toString());
    console.log("User enrolled courses:", enrolled);

    const freq = {};
    user.browsedCourses.forEach((course) => {
      const id = course._id ? course._id.toString() : course.toString();
      freq[id] = (freq[id] || 0) + 1;
    });
    const topBrowsed = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    const relevantCourses = [...new Set([...enrolled, ...topBrowsed])];
    console.log("Relevant courses:", relevantCourses);

    let papers;
    if (relevantCourses.length === 0) {
      papers = await Paper.find().populate("course").sort({ createdAt: -1 }).limit(10);
    } else {
      papers = await Paper.find({ course: { $in: relevantCourses } })
        .populate("course")
        .sort({ createdAt: -1 });
    }
    res.json(papers);
  } catch (error) {
    console.error("Error in dashboard:", error);
    res.status(500).json({ message: error.message });
  }
};

const UpdateBrowsedCourse = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    const { course: courseCode } = req.body;
    if (!courseCode) {
      return res.status(400).json({ message: "Course code is required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const foundCourse = await Course.findOne({ code: courseCode });
    if (!foundCourse) {
      return res.status(400).json({ message: "No course found with the given code" });
    }

    if (!user.browsedCourses.some((c) => c.equals(foundCourse._id))) {
      user.browsedCourses.push(foundCourse._id);
    }
    await user.save();
    res.json({ message: "User browsed courses updated" });
  } catch (error) {
    console.error("Error updating browsed courses:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPaperByID = async (req, res) => {
  try {
    console.log(req.body);
    const { paperID } = req.body;
    const paper = await Paper.findById(paperID).populate("course");
    if (!paper) {
      return res.status(403).json({
        success: false,
        message: "No paper found for the provided paper ID.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Paper retrieved successfully.",
      paper,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while retrieving the paper.",
    });
  }
}
exports.UploadPaper = UploadPaper;
exports.GetQuestion = GetQuestion;
exports.GetPapers = GetPapers;
exports.GetDashboard = GetDashboard;
exports.UpdateBrowsedCourse = UpdateBrowsedCourse;