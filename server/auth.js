import { db } from './storage.js';

export function isTestModeRequest(req) {
  return process.env.NODE_ENV === 'test' && !!req.headers['x-test-user-id'];
}

export async function resolveAuthenticatedUser(req) {
  if (req.user) {
    return req.user;
  }

  if (isTestModeRequest(req)) {
    const id = req.headers['x-test-user-id'];

    let user = await db('users').where({ id }).first();

    if (!user) {
      await db('users').insert({
        id,
        google_id: id,
        email: `${id}@test.local`,
        name: 'Playwright Test User',
        picture: null,
      });
    } else if (user.google_id !== id || user.name !== 'Playwright Test User') {
      await db('users')
        .where({ id })
        .update({
          google_id: id,
          email: `${id}@test.local`,
          name: 'Playwright Test User',
          picture: null,
        });
    }

    user = await db('users').where({ id }).first();
    return user;
  }

  return null;
}

export async function requireAuth(req, res, next) {
  try {
    const user = await resolveAuthenticatedUser(req);

    if (user) {
      req.user = user;
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized' });
  } catch (error) {
    return next(error);
  }
}