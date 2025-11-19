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

export async function sendResetPasswordEmail(to: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Request",
    text: `Click the link to reset your password: ${resetLink}`,
    html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
  });
}
