export function requireAuth(req, res, next) {
  // test bypass for automated tests
  if (process.env.NODE_ENV === 'test' && req.headers['x-test-user-id']) {
    req.user = { id: req.headers['x-test-user-id'] };
    return next();
  }

  if (req.isAuthenticated?.() && req.user) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
}