const nodemailer = require('nodemailer');

const isPlaceholder = (value) => {
  return !value || /^(your_|replace_this)/i.test(value);
};

const sendEmail = async ({ to, subject, html }) => {
  if (
    isPlaceholder(process.env.SMTP_HOST) ||
    isPlaceholder(process.env.SMTP_USER) ||
    isPlaceholder(process.env.SMTP_PASS)
  ) {
    console.warn('Email not sent: SMTP settings are not configured.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
