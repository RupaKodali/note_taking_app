const jwt = require("jsonwebtoken");
const config = require("../config");
const Blacklist = require("../models/Blacklist");

const secretKey = config.app.jwtSecret;

let expiresIn = "1h";

// Function to create a JWT
function signToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn });
}

// Middleware function to verify JWT
const verifyToken = async (req, res, next) => {
  // Get the token from the request header
  const token = req.headers.authorization
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "No token provided" });
  }
  let blacklisted = await Blacklist.find({ token: token });
console.log("blacklisted",blacklisted);
  if (blacklisted) {
    return res
      .status(401)
      .json({ status: false, message: "Please login to continue!" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }

    // Attach the decoded user information to the request for later use
    req.user = decoded;

    // Continue with the request
    next();
  });
};

module.exports = { signToken, verifyToken };
