const mongoose = require('mongoose');

// Schema for the User model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  adminid: {
    type: String,
    required: true,
    unique: true // Admin ID must be unique
  },
  email: {
    type: String,
    required: true,
    unique: true, // Email must be unique
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Model for the User
const User = mongoose.model('User', userSchema);

module.exports = User;
