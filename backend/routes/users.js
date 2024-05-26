const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Register route
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    res.status(200).json(user._id);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Log the input for debugging
    console.log("Login attempt with:", usernameOrEmail, password);

    // Find the user by either username or email
    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    });

    // Log the found user for debugging
    console.log("User found:", user);

    if (!user) {
      return res.status(400).json("Wrong username or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    // Log password validation result
    console.log("Password valid:", validPassword);

    if (!validPassword) {
      return res.status(400).json("Wrong username or password");
    }

    res.status(200).json({ _id: user._id, username: user.username });
  } catch (err) {
    // Log the error for debugging
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
