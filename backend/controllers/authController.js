const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "please provide all required fields" });
    }

    //check if user already exit
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    //create new user
    const user = await User.create({
      name,
      email,
      password,
      provider: "credentials",
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      samesite: "none",
      secure: true,
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        provider: user.provider,
      },
      message: "user register successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "please provide email and password" });
    }

    //check if user already exit
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      samesite: "none",
      secure: true,
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        provider: user.provider,
      },
      message: "user login successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "user not found" });
    }

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        provider: user.provider,
      },
      message: "user profile get successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      samesite: "none",
      secure: true,
    });

    res.redirect(`${process.env.FRONTNED_URL}/auth/success-login?token=${token}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
