const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpError = require("../Utils/HttpError");
const User = require("../Models/User");
const Course = require("../Models/Course");

const Signup = async (req, res, next) => {
  const { Name, Email, Password, referralCode: referralCode, enrolledCourses } = req.body;
  try {
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return next(new HttpError("User already exists", 422));
    }
    let credit = 500
    if (referralCode){
      const userReferred = await User.findOne({RefCode:referralCode});
      if (!userReferred){
        return next(new HttpError("User with this referral code doesn't exist.",400))
      }
      credit += 200
      userReferred.Credit+=200
    }
    const hashPassword = await bcrypt.hash(Password, 12);

    // Now assume that enrolledCourses is already an array of valid Course ObjectId strings.
    const newUser = new User({
      Name,
      Email,
      Password: hashPassword,
      Credit: credit,
      enrolledCourses: enrolledCourses || [],
      RefCode: generateReferralCode()
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, "mayank", { expiresIn: "1h" });

    console.log(newUser);
    res.status(201).json({ userId: newUser._id, token: token, credit: newUser.Credit, refCode: newUser.RefCode });
  } catch (error) {
    console.log(error);
    next(new HttpError("Signup failed, try again later", 500));
  }
};

const Login = async (req, res, next) => {
  const { Email, Password } = req.body;
  console.log("login");

  try {
    const existingUser = await User.findOne({ Email });
    if (
      !existingUser ||
      !(await bcrypt.compare(Password, existingUser.Password))
    ) {
      return next(new HttpError("Invalid credentials", 403));
    }

    const token = jwt.sign({ userId: existingUser._id }, "mayank", {
      expiresIn: "1h",
    });

    res.json({ userId: existingUser._id, token: token, credit: existingUser.Credit, refCode: existingUser.RefCode });
  } catch (error) {
    next(new HttpError("Login failed, try again later.", 500));
  }
};

function generateReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const getUnlockedAnswers = async (req, res, next) => {
  try {
    const { paperId } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "mayank");
    const userId = decodedToken.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const entry = user.unlockedAnswers.find(
      (ua) => ua.paperId.toString() === paperId
    );
    const questionIndexes = entry ? entry.questionIndexes.sort((a, b) => a - b) : [];
    res.status(200).json({ unlockedAnswers: questionIndexes });
  } catch (error) {
    console.error("Error fetching unlocked answers:", error);
    res.status(500).json({ message: "Failed to fetch unlocked answers" });
  }
};

const unlockAnswer = async (req, res, next) => {
  try {
    const { paperId, questionIndex } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "mayank");
    const userId = decodedToken.userId;

    const user = await User.findById(userId);
    if (user.Credit < 5)
      return res.status(400).json({ message: "Insufficient credits" });

    // Deduct credits
    user.Credit -= 5;

    // Find an entry for this paper
    const entry = user.unlockedAnswers.find((ua) => ua.paperId.toString() === paperId);
    if (entry) {
      // If not already unlocked, add the question index
      if (!entry.questionIndexes.includes(questionIndex)) {
        entry.questionIndexes.push(questionIndex);
        entry.questionIndexes.sort((a, b) => a - b);
      }
    } else {
      // Create a new entry for this paper and store the question index in an array
      user.unlockedAnswers.push({ paperId, questionIndexes: [questionIndex] });
    }
    
    await user.save();
    res.status(200).json({ message: "Answer unlocked", credit: user.Credit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to unlock answer" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.userData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
  res.json(user.Notification.sort((a, b) => b.CreatedAt - a.CreatedAt));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (err) {
    next(new HttpError("Failed to fetch user profile", 500));
  }
};

exports.getProfile = getProfile;
exports.Signup = Signup;
exports.Login = Login;
exports.unlockAnswer = unlockAnswer;
exports.getUnlockedAnswers = getUnlockedAnswers;