// routes/userRoutes.js
// Routes for logged-in normal users: dashboard, profile, history, track

const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  getUserDashboard,
  showRequestServicePage,
  showTrackRequestPage,
  showHistoryPage,
  showProfilePage,
  updateProfile,
  changePassword,
} = require('../controllers/userController');

// All routes below require login
router.get('/user/dashboard', protect, getUserDashboard);
router.get('/user/request-service', protect, showRequestServicePage);
router.get('/user/track-request', protect, showTrackRequestPage);
router.get('/user/history', protect, showHistoryPage);
router.get('/user/profile', protect, showProfilePage);

router.post('/api/user/profile', protect, upload.single('profileImage'), updateProfile);
router.post('/api/user/change-password', protect, changePassword);

module.exports = router;
