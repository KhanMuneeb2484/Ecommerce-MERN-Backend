import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST, // Brevo's SMTP server
  port: 587, // or 465 for SSL
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_USER, // Your Brevo email
    pass: process.env.BREVO_PASS, // Your Brevo SMTP key
  },
});

export default transporter;
