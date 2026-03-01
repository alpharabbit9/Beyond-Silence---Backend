import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    console.log("---- EMAIL DEBUG START ----");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS exists?:", process.env.EMAIL_PASS ? "YES" : "NO");
    console.log("---------------------------");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Beyond Silence" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("Email sent successfully ✅");

  } catch (error) {
    console.error("EMAIL ERROR ❌:", error);
    throw error; // important so register catch handles it
  }
};

export default sendEmail;