import userData from "../Models/userModel.js";
import mongoose from "mongoose";
import userVerificationToken from "../Models/userVerificationModel.js";
import crypto from "crypto";
import transporter from "../config/nodeMailer.js";
import jwt from "jsonwebtoken";

const getUsers = async (req, res) => {
  try {
    const users = await userData.find({}).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  const id = req.user.userId;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({ message: "Invalid id" });
  try {
    const user = await userData.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, password, email, phone, address } = req.body;

    // Check if the email already exists
    const existingUser = await userData.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Create a new user
    const user = await userData.create({
      name,
      password,
      email,
      phone,
      address,
    });

    // Create a verification token
    const token = crypto.randomBytes(32).toString("hex");
    const verificationToken = new userVerificationToken({
      userId: user._id,
      token,
    });
    await verificationToken.save();

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL, // Sender address
      to: user.email, // Recipient address
      subject: "Email Verification",
      text: `Please verify your email by clicking the following link: http://localhost:${process.env.PORT}/user/verify-user/${token}`,
    };

    // Send the verification email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error sending verification email" });
      }
      res.status(201).json({
        message:
          "User registered successfully. Please check your email to verify your account.",
      });
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;
  try {
    const verificationToken = await userVerificationToken.findOne({
      userId,
      token,
    });

    if (!verificationToken) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = await userData.findById(userId).select("-password"); // Exclude the password field

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    await userVerificationToken.findByIdAndRemove(verificationToken._id);

    res.status(200).json({ message: "Email verified successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const id = req.user.userId;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({ message: "Invalid id" });
  try {
    const updatedUser = await userData.findOneAndUpdate(
      { _id: id },
      { ...req.body }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Server Error" });
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userData.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "User is not verified. Please verify your email." });
    }

    // Compare the hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Incorrect Username or Password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    user.token = token;
    await user.save();
    res.status(200).json({ message: "User logged in successfully", token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const id = req.user.userId;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({ message: "Invalid id" });
  try {
    const deletedUser = await userData.findOneAndDelete({ _id: id });
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  createUser,
  getUsers,
  getUser,
  updateUser,
  authUser,
  deleteUser,
  verifyEmail,
};
