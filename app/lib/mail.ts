"use server"
import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, code: string, fname: string, lname: string) {
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
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Hello ${fname} ${lname},</h2>
        <p style="color: #555; font-size: 16px;">
          Thank you for joining our application! To login and start using our website, please verify your email.
        </p>
        <div style="margin: 20px 0; text-align: center;">
          <p style="font-weight: bold; color: #333;">Your verification code:</p>
          <span style="display: inline-block; padding: 10px 20px; font-size: 24px; color: #fff; background-color: #007bff; border-radius: 5px;">${code}</span>
        </div>
        <p style="color: #999; font-size: 12px;">If you did not request this email, please ignore it.</p>
      </div>
    `,
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

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/ResetPassword?token=${token}`;
  await transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Request",
    text: `Click the link to reset your password: ${resetLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #555; font-size: 16px;">
          We received a request to reset your password. Click the button below to reset it:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #dc3545; border-radius: 5px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #999; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  });
}
