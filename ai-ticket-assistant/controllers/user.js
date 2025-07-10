import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

// POST /api/auth/signup
export const signupUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ email, password: hashedPassword });

    await inngest.send({
      name: "user/signup",
      data: { email: newUser.email },
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error("❌ Signup Error:", err.message);
    res.status(500).json({ message: "Signup failed" });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({ user, token });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ message: "Login failed" });
  }
};

// POST /api/auth/logout
export const logoutUser = async (req, res) => {
  try {
    // You could blacklist the token using a DB or Redis if needed
    // But for now, just inform client to delete it
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("❌ Logout Error:", err.message);
    res.status(500).json({ message: "Logout failed" });
  }
};

// GET /api/auth/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Fetch Users Error:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// POST /api/auth/update-user
export const updateUserRole = async (req, res) => {
  try {
    const { email, role, skills } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        role,
        skills: Array.isArray(skills) ? skills : [],
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("❌ Update User Error:", err.message);
    res.status(500).json({ error: "Failed to update user" });
  }
};
