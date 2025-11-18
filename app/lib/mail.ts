import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, code: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your email",
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code:</p><h2>${code}</h2>`,
  });
}
