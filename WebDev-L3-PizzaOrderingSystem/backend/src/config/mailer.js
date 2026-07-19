const nodemailer = require("nodemialer");

const transporter = nodemailer.CreateTrasnsporter({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
module.exports = transpporter;
