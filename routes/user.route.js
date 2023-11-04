const express = require("express");
const router = express.Router();

const UsersController = require("../services/user.service.js");
const usersController = new UsersController();

router.post("/signUp", (req, res) => {
  usersController.registerUser(req, res);
});
router.post("/login", (req, res) => {
  usersController.loginUser(req, res);
});
router.post("/verifyEmail", (req, res) => {
  usersController.verifyEmail(req, res);
});
router.post("/forgotPassword", (req, res) => {
  usersController.forgotPassword(req, res);
});
router.post("/resetPassword", (req, res) => {
  usersController.resetPassword(req, res);
});

router.post("/generateUnlockCode", (req, res) => {
  usersController.generateUnlockCode(req, res);
});
router.post("/unlockAccount", (req, res) => {
  usersController.unlockAccount(req, res);
});
module.exports = router;
