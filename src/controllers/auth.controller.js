
// REGISTER (role is NEVER taken from client)
import bcrypt from "bcryptjs";
import validator from "validator";
import cloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const register = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    name = name.trim();
    email = email.trim().toLowerCase();
    password = password.trim();

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔹 Upload profile picture if provided
    let profileUrl = null;

    if (req.file) {
      profileUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile_pictures" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );

        stream.end(req.file.buffer);
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create verification token
    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profilePicture: profileUrl,
      verificationToken: hashedToken,
      verificationTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hou
      role: "user"
    });

    const verificationUrl = `http://localhost:5000/api/auth/verify-email/${rawToken}`;

    await sendEmail(
      user.email,
      "Verify Your Email to Join Beyond Silence",
      `
  <div style="margin:0; padding:0; background-color:#f4f6f9; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          
          <!-- Card Container -->
          <table width="600" cellpadding="0" cellspacing="0" 
            style="background:#ffffff; border-radius:12px; padding:40px; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
            
            <!-- Logo / Title -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h1 style="margin:0; font-size:28px; color:#111827;">
                  Beyond Silence
                </h1>
                <p style="margin:8px 0 0; font-size:14px; color:#6b7280;">
                  Speak. Heal. Connect.
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td>
                <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;">
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:10px 0;">
                <h2 style="margin:0 0 10px; font-size:22px; color:#111827;">
                  Verify Your Email Address
                </h2>
                <p style="margin:0 0 20px; font-size:16px; color:#374151; line-height:1.6;">
                  Thank you for joining <strong>Beyond Silence</strong>. 
                  To complete your registration, please confirm your email address by clicking the button below.
                </p>
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="center" style="padding:20px 0;">
                <a href="${verificationUrl}"
                   style="
                     background-color:#4f46e5;
                     color:#ffffff;
                     text-decoration:none;
                     padding:14px 28px;
                     border-radius:8px;
                     font-size:16px;
                     font-weight:bold;
                     display:inline-block;
                   ">
                   Verify My Email
                </a>
              </td>
            </tr>

            <!-- Fallback Link -->
            <tr>
              <td>
                <p style="margin-top:20px; font-size:14px; color:#6b7280; word-break:break-all;">
                  If the button doesn’t work, copy and paste this link into your browser:
                  <br><br>
                  <a href="${verificationUrl}" style="color:#4f46e5;">
                    ${verificationUrl}
                  </a>
                </p>
              </td>
            </tr>

            <!-- Expiry Notice -->
            <tr>
              <td>
                <p style="margin-top:10px; font-size:13px; color:#9ca3af;">
                  This verification link will expire in 1 hour.
                </p>
              </td>
            </tr>

          </table>

          <!-- Footer -->
          <table width="600" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding-top:20px;">
                <p style="font-size:12px; color:#9ca3af;">
                  © ${new Date().getFullYear()} Beyond Silence. All rights reserved.
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </div>
  `
    );

    res.status(201).json({
      message: "Registered successfully. Please verify your email."
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token"
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Verification failed"
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // 🔹 Basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    // 🔹 Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // 🔹 Check if email verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in"
      });
    }

    // 🔹 Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // 🔹 Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
};