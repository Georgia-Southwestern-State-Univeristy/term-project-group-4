export function isTestModeRequest(req) {
  return process.env.NODE_ENV === 'test' && !!req.headers['x-test-user-id'];
}

export function resolveAuthenticatedUser(req) {
  if (req.user) {
    return req.user;
  }

  if (isTestModeRequest(req)) {
    return {
      id: req.headers['x-test-user-id'],
      displayName: 'Playwright Test User',
      email: `${req.headers['x-test-user-id']}@test.local`,
    };
  }

  return null;
}

export function requireAuth(req, res, next) {
  const user = resolveAuthenticatedUser(req);

  if (user) {
    req.user = user;
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
}