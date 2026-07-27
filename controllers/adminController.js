// controllers/adminController.js
// Handles admin dashboard, user management, and analytics

const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');

// @desc    Admin dashboard - shows overall statistics
// @route   GET /admin/dashboard
const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalRequests = await ServiceRequest.countDocuments();
    const pendingRequests = await ServiceRequest.countDocuments({ status: 'Pending' });
    const approvedRequests = await ServiceRequest.countDocuments({ status: 'Approved' });
    const rejectedRequests = await ServiceRequest.countDocuments({ status: 'Rejected' });
    const completedRequests = await ServiceRequest.countDocuments({ status: 'Completed' });

    const recentRequests = await ServiceRequest.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: {
        totalUsers,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        completedRequests,
      },
      recentRequests,
    });
  } catch (error) {
    console.error('Get Admin Dashboard Error:', error.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Render manage users page
// @route   GET /admin/users
const getManageUsersPage = (req, res) => {
  res.render('admin/users', { title: 'Manage Users' });
};

// @desc    Get all users (JSON, for AJAX table with search)
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const filter = { role: 'user' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const totalRecords = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      users,
      totalPages,
      currentPage: Number(page),
      totalRecords,
    });
  } catch (error) {
    console.error('Get All Users Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a user (admin only)
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    // Also delete all their service requests for data consistency
    await ServiceRequest.deleteMany({ userId: req.params.id });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Render manage requests page
// @route   GET /admin/requests
const getManageRequestsPage = (req, res) => {
  res.render('admin/requests', { title: 'Manage Requests' });
};

// @desc    Render analytics page
// @route   GET /admin/analytics
const getAnalyticsPage = async (req, res) => {
  try {
    const statusCounts = await ServiceRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const serviceTypeCounts = await ServiceRequest.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 } } },
    ]);

    // Requests created per month (for the current year) - simple aggregation for chart
    const monthlyData = await ServiceRequest.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.render('admin/analytics', {
      title: 'Analytics',
      statusCounts: JSON.stringify(statusCounts),
      serviceTypeCounts: JSON.stringify(serviceTypeCounts),
      monthlyData: JSON.stringify(monthlyData),
    });
  } catch (error) {
    console.error('Analytics Error:', error.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getAdminDashboard,
  getManageUsersPage,
  getAllUsers,
  deleteUser,
  getManageRequestsPage,
  getAnalyticsPage,
};
