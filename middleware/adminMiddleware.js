// middleware/adminMiddleware.js
// Ensures that only users with role "admin" can access the route
// Must be used AFTER the "protect" middleware, since it relies on req.user

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  if (req.originalUrl.startsWith('/api')) {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }

  return res.status(403).render('admin/login', {
    title: 'Admin Login',
    error: 'Access denied. Admins only. Please login as admin.',
  });
};

module.exports = { isAdmin };
