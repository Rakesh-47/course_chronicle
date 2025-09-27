const express = require("express");
const router = express.Router();
const UserControllers = require( "../Controllers/UserControllers");
const IsAuthenticated = require("../Middleware/UserAuth");

router.post("/signup", UserControllers.Signup);
router.post("/login", UserControllers.Login);
router.post("/unlockAnswer", UserControllers.unlockAnswer);
router.get("/notifications", IsAuthenticated, UserControllers.getNotifications);
router.post("/getUnlockedAnswers", UserControllers.getUnlockedAnswers);
router.get("/profile", IsAuthenticated, UserControllers.getProfile);

module.exports = router;
