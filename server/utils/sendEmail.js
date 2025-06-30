const sendEmail = async ({ to, subject, text }) => {
  console.log(`Sending email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Text:\n${text}`);
};

module.exports = { sendEmail };
