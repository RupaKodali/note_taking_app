const nodemailer = require("nodemailer");
const config = require('../config')

let fromEmail = config.email.fromEmail;
let emailPassword = config.email.emailPassword;

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: fromEmail,
    pass: emailPassword,
  },
});

transporter.verify().catch(console.error);

const sendCustomEmail = async (to, subject, html) => {
  transporter
    .sendMail({
      from: `"Note Down." ${fromEmail}`, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: html, // html body
    })
    .then((info) => {
      console.log({ info });
    })
    .catch(console.error);
};

module.exports = sendCustomEmail;
