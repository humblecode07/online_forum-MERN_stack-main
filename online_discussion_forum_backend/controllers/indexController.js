const User = require('../models/users');
const Instructor = require('../models/instructor')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const asyncHandler = require("express-async-handler");

exports.home_page = asyncHandler(async (req, res, next) => {
    res.render('index', { title: 'kim ambilibabol basketbol' });
});


/* Handle user log in GET*/
exports.log_in_page = asyncHandler(async (req, res, next) => {
    
});

/* Handle user log in POST*/
exports.log_in = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  let user = await User.findOne({ email }).exec();
  let instructor = await Instructor.findOne({ email }).exec();

  let foundUser = user || instructor;
  if (!foundUser) return res.sendStatus(401);

  const match = await bcrypt.compareSync(password, foundUser.pass);
  if (!match) return res.sendStatus(401);

  const roles = Object.values(foundUser.role).filter(Boolean);
  const token = jwt.sign({
    email: foundUser.email,
    roles: roles,
    userId: foundUser._id
  }, process.env.JWT_KEY, {
    expiresIn: '1d'
  });

  const refreshToken = jwt.sign({
    email: foundUser.email,
    roles: roles,
    userId: foundUser._id
  }, process.env.REFRESH_JWT_KEY, {
    expiresIn: '2d'
  });

  foundUser.refreshToken = refreshToken;
  await foundUser.save();

  res.status(200).json({
    response: 'Auth Successful.',
    token: token,
    refreshToken: refreshToken
  });
});
