// models/User.js
// Mongoose schema for Users (both normal users and admin use this same collection,
// differentiated by the "role" field)

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    address: {
      type: String,
      default: '',
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'Truck', 'Bus', 'Other'],
      default: 'Car',
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profileImage: {
      type: String,
      default: '/images/default-avatar.png',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

module.exports = mongoose.model('User', userSchema);
