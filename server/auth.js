function buildTestUser(userId) {
  return {
    id: userId,
    google_id: userId,
    name: 'Playwright Test User',
    email: `${userId}@test.local`,
  };
}

export function resolveAuthenticatedUser(req) {
  if (req.user) {
    return req.user;
  }

  if (process.env.NODE_ENV === 'test' && req.headers['x-test-user-id']) {
    return buildTestUser(req.headers['x-test-user-id']);
  }

  return null;
}

export function isTestModeRequest(req) {
  return process.env.NODE_ENV === 'test' && Boolean(req.headers['x-test-user-id']);
}

export function requireAuth(req, res, next) {
  const user = resolveAuthenticatedUser(req);

  if (user) {
    req.user = user;
    return next();
  }

  if (req.isAuthenticated?.() && req.user) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
}