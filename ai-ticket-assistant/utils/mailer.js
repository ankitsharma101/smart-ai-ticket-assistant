export const sendMail = async (to, subject, body) => {
  console.log(`📧 Email to: ${to} | Subject: ${subject}`);
  console.log(`Body: ${body}`);
  // Simulate email - plug in real SMTP (like Nodemailer) later if needed
};
