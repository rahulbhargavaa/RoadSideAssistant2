// controllers/userController.js
// Handles logic for normal user pages: dashboard, profile, history

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');

// @desc    User dashboard - shows stats + recent requests
// @route   GET /user/dashboard
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalRequests = await ServiceRequest.countDocuments({ userId });
    const pendingRequests = await ServiceRequest.countDocuments({ userId, status: 'Pending' });
    const completedRequests = await ServiceRequest.countDocuments({ userId, status: 'Completed' });
    const activeRequests = await ServiceRequest.countDocuments({
      userId,
      status: { $in: ['Approved', 'Mechanic Assigned', 'On The Way'] },
    });

    const recentRequests = await ServiceRequest.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('user/dashboard', {
      title: 'My Dashboard',
      stats: { totalRequests, pendingRequests, completedRequests, activeRequests },
      recentRequests,
      notifications,
    });
  } catch (error) {
    console.error('Get User Dashboard Error:', error.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Show request-service page
// @route   GET /user/request-service
const showRequestServicePage = (req, res) => {
  res.render('request-service', { title: 'Request Service', error: null, success: null });
};

// @desc    Show track-request page (lists all requests of logged in user)
// @route   GET /user/track-request
const showTrackRequestPage = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.render('track-request', { title: 'Track Request', requests });
  } catch (error) {
    console.error('Track Request Error:', error.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Show history page (all past requests - completed/cancelled/rejected)
// @route   GET /user/history
const showHistoryPage = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      userId: req.user._id,
      status: { $in: ['Completed', 'Cancelled', 'Rejected'] },
    }).sort({ createdAt: -1 });

    res.render('user/history', { title: 'My History', requests });
  } catch (error) {
    console.error('History Error:', error.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Show profile page
// @route   GET /user/profile
const showProfilePage = (req, res) => {
  res.render('user/profile', { title: 'My Profile', error: null, success: null });
};

// @desc    Update profile details
// @route   POST /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const { name, mobile, address, vehicleType, vehicleNumber } = req.body;

    const updateData = { name, mobile, address, vehicleType, vehicleNumber };

    if (req.file) {
      updateData.profileImage = '/uploads/' + req.file.filename;
    }

    await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    res.render('user/profile', {
      title: 'My Profile',
      error: null,
      success: 'Profile updated successfully',
      user: await User.findById(req.user._id),
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.render('user/profile', {
      title: 'My Profile',
      error: 'Failed to update profile. Please try again.',
      success: null,
    });
  }
};

// @desc    Change password
// @route   POST /api/user/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.render('user/profile', {
        title: 'My Profile',
        error: 'Current password is incorrect',
        success: null,
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.render('user/profile', {
        title: 'My Profile',
        error: 'New passwords do not match',
        success: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.render('user/profile', {
      title: 'My Profile',
      error: null,
      success: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change Password Error:', error.message);
    res.render('user/profile', {
      title: 'My Profile',
      error: 'Failed to change password',
      success: null,
    });
  }
};

module.exports = {
  getUserDashboard,
  showRequestServicePage,
  showTrackRequestPage,
  showHistoryPage,
  showProfilePage,
  updateProfile,
  changePassword,
};
