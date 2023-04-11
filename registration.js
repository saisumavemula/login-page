const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    // Check if user already exists in the database
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password and save the user to the database
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name,
      contactNumber: req.body.contactNumber,
    });
    const savedUser = await user.save();

    // Generate an OTP and send it to the user's email/phone number
    const otp = Math.floor(1000 + Math.random() * 9000);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: 'Verification Code for Your Account',
      text: `Your verification code is ${otp}`,
    };
    await transporter.sendMail(mailOptions);

    // Return success message and OTP
    res.status(200).json({ message: 'User created successfully', otp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
