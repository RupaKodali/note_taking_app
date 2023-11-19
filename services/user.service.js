// users.controller.js
const userSchema = require("../models/UserSchema.js");
const roleSchema = require("../models/roleSchema.js");
const argon2 = require("argon2");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const userRoleSchema = require("../models/userRoleSchema.js");
const sendSMS = require("../utils/send-sms.js");
const fs = require("fs");
const fillTemplateWithData = require("../utils/templates/mange_template.js");
const { signToken } = require("../utils/jwt.js");
const sendCustomEmail = require("../utils/mail.js");
const Blacklist = require("../models/Blacklist.js");

class UsersController {
  async registerUser(req, res) {
    try {
      // Validate the user input
      const { firstName, lastName, email, password, phone } = req.body;
      if (!firstName || !lastName || !email || !password || !phone) {
        return res.status(400).json({ status: false, message: "Missing required fields" });
      }

      // Check if the user already exists
      const existingUser = await userSchema.find({ email: email });
      if (existingUser) {
        return res.status(409).json({ status: false, message: "User already exists" });
      }

      // Hash the password
      const hashedPassword = await argon2.hash(password);
      const encryptionKey = crypto.randomBytes(32).toString("hex");
      // const encryptionKey = crypto.scryptSync(password, 'GfG', 24);

      // Create a new user document
      const user = await userSchema.create({
        userId: uuidv4(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        phone: phone,
        encryptionKey: encryptionKey,
      });

      const role = await roleSchema.find({ name: "ADMIN" });

      if (!role || role.length === 0) {
        return res.status(404).json({ status: false, message: "Role not found" });
      }

      const user_role = await userRoleSchema.create({
        userId: user.userId,
        roleId: role.roleId,
      });

      // Respond with success
      res.status(201).json({ status: true, message: "User registered successfully" });
    } catch (error) {
      // Handle and log any errors
      console.error(error);
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  }

  async createUser(body) {
    const user = await userSchema.create({
      userId: uuidv4(),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.Mathemail,
      phone: body.phone,
      encryptionKey: body.encryptionKey,
    });

    const user_role = await userSchema.create({
      userId: user.userId,
      roleId: body.roleId,
    });

    // Respond with success
    res.status(201).json({ status: true, message: "User registered successfully" });
  }

  async loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: false, message: "Missing required fields" });
    }

    // Find the user by email
    const user = await userSchema.find({ email: email });
    console.log("user", user);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    //User created by Admin
    if (!user.password) {
      return res
        .status(404)
        .json({ status: false, message: "Click on forgot password to create a new one" });
    }

    // Check if the user's account is locked due to too many failed login attempts
    if (user.failedLoginAttempts >= process.env.MAX_FAILED_LOGIN_ATTEMPTS) {
      return res.status(401).json({
        status: false,
        message: "Account is locked due to too many failed login attempts, Click on Forgot password to Unlock and create a new password",
      });
    }

    // Compare the password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      // Increment the failed login attempts count
      user.failedLoginAttempts++;
      await userSchema.update({ userId: user.userId }, user);
      return res.status(401).json({ status: false, message: "Invalid password" });
    }

    // Reset the failed login attempts count upon successful login
    user.failedLoginAttempts = 0;
    await userSchema.update({ userId: user.userId }, user);

    //TODO: Check if 2FA is enabled and perform 2FA verification if necessary
    if (user.twoFactorEnabled) {
      // Implement 2FA verification here
      // Return a response based on the 2FA verification result
    }
    const min = 100000;
    const max = 999999;
    // const resetToken = 666666;
    const resetToken = Math.floor(
      min + Math.random() * (max - min + 1)
    ).toString();

    // Send the email to the user
    try {
      const data = await fs.readFileSync(
        "utils/templates/email/email_verification.html",
        "utf8"
      );
      let subject = "Email Verification";
      var html = await fillTemplateWithData(data, {
        Username: user.firstName + user.lastName,
        PasswordResetCode: resetToken,
      });
      await sendCustomEmail(user.email, subject, html);
    } catch (err) {
      console.error("Error reading the file:", err);
    }

    await userSchema.update(
      { userId: user.userId },
      { resetToken: resetToken }
    );
    // Respond with success
    res.status(200).json({ status: true, message: "Email Verification required to log in successfully" });
  }

  async verifyEmail(req, res) {
    const { email, code } = req.body;

    // Verify the token and its expiration date in the database
    let user = await userSchema.find({ email: email });
    if (user.resetToken !== code) {
      return res.status(401).json({ status: false, message: "Invalid Verification token" });
    }

    const payload = {
      userId: user.userId,
      email: user.email,
    };

    // Generate the JWT token
    const token = signToken(payload);

    // Respond with success
    res.status(200).json({ status: true, token: token, message: "Logged In successfully" });

    await userSchema.update({ userId: user.userId }, { resetToken: null });
  }

  async forgotPassword(req, res) {
    const { email } = req.body;
    // Find the user by email
    const user = await userSchema.find({ email: email });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Generate a reset token
    // const resetToken = crypto.randomBytes(20).toString("hex");
    const min = 100000;
    const max = 999999;
    // const resetToken = 666666;

    const resetToken = Math.floor(
      min + Math.random() * (max - min + 1)
    ).toString();

    // Store the token and its expiration date in the user's record in the database
    await userSchema.update(
      { userId: user.userId },
      { resetToken: resetToken }
    );

    // Send an email to the user with a link that includes the reset token
    // const resetLink = `https://example.com/reset-password?token=${resetToken}`; //TODO

    // Send the email to the user
    try {
      if (user.failedLoginAttempts >= process.env.MAX_FAILED_LOGIN_ATTEMPTS) {
        var data = await fs.readFileSync(
          "utils/templates/email/unlock_account.html",
          "utf8"
        );
        var subject = "Unlock your account";
        var html = await fillTemplateWithData(data, {
          Username: user.firstName + user.lastName,
          PasswordResetCode: resetToken,
        });
      } else {
        var data = await fs.readFileSync(
          "utils/templates/email/forgot_password.html",
          "utf8"
        );
        var subject = "Password reset";
        var html = await fillTemplateWithData(data, {
          Username: user.firstName + user.lastName,
          PasswordResetCode: resetToken,
        });
      }

      await sendCustomEmail(user.email, subject, html);
    } catch (err) {
      console.error("Error reading the file:", err);
    }

    // await sendSMS(body);

    res.status(200).json({ status: true, message: "Password reset email and sms sent" });
  }

  async resetPassword(req, res) {
    const { email, resetToken, newPassword } = req.body;

    // Verify the token and its expiration date in the database
    let user = await userSchema.find({ email: email });
    if (user.resetToken !== resetToken) {
      return res.status(401).json({ status: false, message: "Invalid Reset token" });
    }
    // If the token is valid, update the user's password
    const hashedPassword = await argon2.hash(newPassword);
    if (user.failedLoginAttempts >= process.env.MAX_FAILED_LOGIN_ATTEMPTS) {
      var failedLoginAttempts=0
    }
    await userSchema.update(
      { userId: user.userId },
      { password: hashedPassword, resetToken: null,failedLoginAttempts:failedLoginAttempts }
    );

   
    res.status(200).json({ status: true, message: "Password reset successfully" });
  }

  async generateUnlockCode(req, res) {
    // Find the user by email
    const { email } = req.body;

    const user = await userSchema.find({ email: email });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Generate a random 6-digit unlock code
    const min = 100000;
    const max = 999999;
    // const unlockCode = 666666;

    const unlockCode = Math.floor(
      min + Math.random() * (max - min + 1)
    ).toString();

    await userSchema.update(
      { userId: user.userId },
      { unlockCode: unlockCode }
    );

    // Send the email to the user
    try {
      const data = await fs.readFileSync(
        "utils/templates/email/unlock_account.html",
        "utf8"
      );
      let subject = "Unlock your account";
      var html = await fillTemplateWithData(data, {
        Username: user.firstName + user.lastName,
        PasswordResetCode: unlockCode,
      });
      await sendCustomEmail(user.email, subject, html);
    } catch (err) {
      console.error("Error reading the file:", err);
    }

    // await sendSMS(body);

    res.status(200).json({ status: true, message: "Unlock code sent via email and sms" });
  }

  async unlockAccount(req, res) {
    const { email, unlockCode } = req.body;

    // Find the user by email
    const user = await userSchema.find({ email: email });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Check if the unlock code matches the one sent to the user
    if (user.unlockCode !== unlockCode) {
      return res.status(401).json({ status: false, message: "Invalid unlock code" });
    }

    // Verify the user's identity (e.g., through email confirmation or other methods)

    // Reset the failed login attempts to zero
    user.failedLoginAttempts = 0;
    user.unlockCode = null; // Clear the unlock code, assuming it's a one-time code

    // Save the updated user document
    await userSchema.update({ userId: user.userId }, user);

    // Notify the user that their account is unlocked

    res.status(200).json({ status: true, message: "Account unlocked successfully" });
  }

  async logoutUser(req, res) {
    await Blacklist.create({ token: req.headers.authorization.split(" ")[1] });
    res.status(200).json({ status: true, message: "Successfully Logged out" });
  }
}

module.exports = UsersController;
