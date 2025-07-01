const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM;

const sendEmail = async ({ to, subject, text }) => {
  try {
    console.log(`Sending email to: ${to}`);

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      text,
    });

    console.log(`Successfully sent email sent to ${to}`, response);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendEmail };
