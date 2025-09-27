const jwt = require("jsonwebtoken");
const HttpError = require("../Utils/HttpError");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      throw new Error("Authentication  uu failed!");
    }
    const decodedToken = jwt.verify(token, "mayank");
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError("Authentication uuu failed!", 403);
    return next(error);
  }
};
