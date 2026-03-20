import User from "../../models/user/index.js";
import { v4 as uuidv4 } from "uuid";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authService = {

  // 🔹 SIGNUP LOGIC
  async signup(data) {

    const requiredFields = ["name", "email", "password"];

    for (const field of requiredFields) {
      if (!data[field]) {
        return { error: `Missing field: ${field}` };
      }
    }

    const existingUser = await User.findOne({
      email: data.email,
      is_deleted: false
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = new User({
      user_id: `USER_${uuidv4()}`,
      name: data.name,
      email: data.email,
      password: hashedPassword
    });

    await newUser.save();

    return { success: "User registered successfully" };
  },

  // 🔹 SIGNIN LOGIC
  async signin(data) {

    const { email, password } = data;

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    const user = await User.findOne({
      email,
      is_deleted: false
    });

    if (!user) {
      return { error: "User not found" };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { error: "Invalid password" };
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    return {
      success: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email
      }
    };
  }

};

export default authService;