import express from 'express';
import fs from 'fs';
import path from 'path';
import {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  findOrCreateUser,
  getUserById,
  migrateLatest,
} from './server/storage.js';
import { requireAuth, resolveAuthenticatedUser, isTestModeRequest } from './server/auth.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { log, logger } from './server/logger.js';
import { v4 as uuidv4 } from 'uuid';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const swaggerDocument = YAML.load('./docs/api/openapi.yaml');

const app = express();
const PORT = process.env.PORT || 3000;
const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';
const distDir = path.resolve(process.cwd(), 'dist');
const appVersion = process.env.npm_package_version || 'unknown';
const __filename = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;

function resolveRequestId(req) {
  if (req.requestId) return req.requestId;

  const headerRequestId = req.headers['x-request-id'];
  if (typeof headerRequestId === 'string' && headerRequestId.trim()) {
    return headerRequestId.trim();
  }

  return uuidv4();
}

function getMissingStartupConfigKeys() {
  const missing = [];

  if (!isTest) {
    if (!process.env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
    if (!process.env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
  }

  if (isProduction) {
    if (!process.env.SESSION_SECRET) missing.push('SESSION_SECRET');
    if (!process.env.SQLITE_PATH) missing.push('SQLITE_PATH');
  }

  return missing;
}

function validateStartupConfig() {
  const missingKeys = getMissingStartupConfigKeys();
  if (missingKeys.length === 0) return;

  throw new Error(
    `Missing required configuration: ${missingKeys.join(', ')}. ` +
      'Update your environment variables before starting the server.',
  );
}

function getConfiguredDbPath() {
  if (isTest) return ':memory:';
  if (isProduction) return process.env.SQLITE_PATH || '/data/trips.db';
  return path.resolve(process.cwd(), 'data', 'trips.db');
}

function isMounted(targetPath) {
  try {
    const mounts = fs.readFileSync('/proc/mounts', 'utf8');
    return mounts.includes(targetPath);
  } catch {
    return false;
  }
}

function getDbPathStatus() {
  const dbPath = getConfiguredDbPath();

  if (dbPath === ':memory:') {
    return {
      path: dbPath,
      writable: true,
      target: dbPath,
      error: null,
    };
  }

  const targetPath = fs.existsSync(dbPath) ? dbPath : path.dirname(dbPath);

  try {
    fs.accessSync(targetPath, fs.constants.W_OK);
    return {
      path: dbPath,
      writable: true,
      target: targetPath,
      error: null,
    };
  } catch (error) {
    return {
      path: dbPath,
      writable: false,
      target: targetPath,
      error: error.message,
    };
  }
}

function ensureProductionStorageReady() {
  if (!isProduction) return;

  if (!process.env.SQLITE_PATH) {
    throw new Error('SQLITE_PATH must be set in production. Refusing to start without an explicit persistent DB path.');
  }

  if (process.env.SQLITE_PATH.startsWith('/data')) {
    if (!isMounted('/data')) {
      throw new Error('/data is not mounted. Refusing to start. Verify that the EBS volume was successfully attached by the predeploy hook.');
    }
  }

  const dbStatus = getDbPathStatus();
  if (!dbStatus.writable) {
    throw new Error(`Configured SQLite path is not writable: ${dbStatus.target}. ${dbStatus.error}`);
  }
}

// Passport configuration (only in non-test environments)
if (!isTest) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Session configuration
const getSessionSecret = () => {
  if (process.env.NODE_ENV === 'test') {
    return 'test-secret-key-do-not-use-in-production';
  }

  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET must be set in production.');
  }

  return process.env.SESSION_SECRET || 'default-dev-secret-change-in-production';
};

app.use(session({
  secret: getSessionSecret(),
  resave: false,
  saveUninitialized: false,
  proxy: isProduction,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
  },
}));

if (isProduction) {
  app.set('trust proxy', 1);
}

if (!isTest) {
  app.use(passport.initialize());
  app.use(passport.session());
}

app.use(express.json());

// Correlate request/response logs and surface request IDs to clients for support debugging.
app.use((req, res, next) => {
  const requestId = resolveRequestId(req);
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.info({
      timestamp: new Date().toISOString(),
      requestId,
      action: 'HTTP_REQUEST',
      status: 'COMPLETE',
      details: {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
        userId: req.user?.id || null,
      },
    });
  });

  next();
});

app.get('/health', (req, res) => {
  const dbStatus = getDbPathStatus();
  const statusCode = dbStatus.writable ? 200 : 503;
  const missingConfig = getMissingStartupConfigKeys();

  const baseResponse = {
    status: dbStatus.writable ? 'ok' : 'degraded',
    environment: process.env.NODE_ENV || 'development',
    version: appVersion,
    requestId: resolveRequestId(req),
    uptimeSeconds: Math.floor(process.uptime()),
  };

  // In production, avoid exposing internal filesystem paths or low-level errors.
  const responseBody = isProduction
    ? {
        ...baseResponse,
        database: {
          writable: dbStatus.writable,
        },
        config: {
          valid: missingConfig.length === 0,
        },
      }
    : {
        ...baseResponse,
        // In non-production, include full database status for easier debugging.
        database: dbStatus,
        config: {
          valid: missingConfig.length === 0,
          missing: missingConfig,
        },
      };

  res.status(statusCode).json(responseBody);
});

// Auth routes (Google OAuth only in production/development)
if (!isTest) {
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login-error' }),
    (req, res) => {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(frontendUrl);
    },
  );

  app.get('/auth/login-error', (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?authError=google_login_failed`);
  });
}

app.get('/auth/logout', (req, res, next) => {
  if (isTestModeRequest(req)) {
    return res.status(200).json({ success: true, testMode: true });
  }

  if (typeof req.logout !== 'function') {
    return res.status(200).json({ success: true });
  }

  req.logout((error) => {
    if (error) return next(error);

    req.session.destroy((sessionError) => {
      if (sessionError) return next(sessionError);

      res.clearCookie('connect.sid');
      res.status(200).json({ success: true });
    });
  });
});

app.get('/auth/user', async (req, res) => {
  const requestId = resolveRequestId(req);
  try {
    const user = await resolveAuthenticatedUser(req);

    if (user) {
      req.user = user;
      return res.json(user);
    }

    return res.status(401).json({ error: 'Not authenticated' });
  } catch (error) {
    await log(requestId, 'AUTH_USER', 'ERROR', {
      reason: error.message,
      errorType: error.constructor?.name,
      stack: error.stack?.split('\n').slice(0, 3),
    });
    return res.status(500).json({ error: 'Internal server error', requestId });
  }
});

// GET /api/trips - List all trips
app.get('/api/trips', requireAuth, async (req, res) => {
  const requestId = resolveRequestId(req);
  try {
    await log(requestId, 'GET_TRIPS', 'START');
    const trips = await getAllTrips(req.user.id);
    await log(requestId, 'GET_TRIPS', 'SUCCESS', { count: trips.length });
    res.json(trips);
  } catch (error) {
    await log(requestId, 'GET_TRIPS', 'ERROR', {
      reason: error.message,
      errorType: error.constructor?.name,
      stack: error.stack?.split('\n').slice(0, 3),
    });
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// GET /api/trips/:tripId - Get a single trip by ID
app.get('/api/trips/:tripId', requireAuth, async (req, res) => {
  const requestId = resolveRequestId(req);
  const { tripId } = req.params;

  try {
    const trip = await getTripById(tripId, req.user.id);
    if (!trip) {
      await log(requestId, 'GET_TRIP', 'NOT_FOUND', {
        tripId,
        reason: 'Trip does not exist',
      });
      return res.status(404).json({ error: 'Trip not found' });
    }

    await log(requestId, 'GET_TRIP', 'SUCCESS', {
      tripId: trip.id,
      name: trip.name,
      destinationType: trip.destinationType,
      duration: trip.duration,
      itemCount: trip.checklist ? trip.checklist.length : 0,
    });

    res.json(trip);
  } catch (error) {
    await log(requestId, 'GET_TRIP', 'ERROR', {
      tripId,
      reason: error.message,
      errorType: error.constructor.name,
      stack: error.stack.split('\n').slice(0, 3),
    });
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// POST /api/saveTrip - Create new trip with checklist
app.post('/api/saveTrip', requireAuth, async (req, res) => {
  const requestId = resolveRequestId(req);

  try {
    const { name, destinationType, duration, checklist } = req.body;
    const trimmedName = name?.trim();
    const trimmedType = destinationType?.trim();

    await log(requestId, 'CREATE_TRIP', 'START', {
      name,
      destinationType,
      duration,
    });

    if (!trimmedName || !trimmedType || duration === undefined || duration === null) {
      const missingFields = [];
      if (!trimmedName) missingFields.push('name');
      if (!trimmedType) missingFields.push('destinationType');
      if (duration === undefined || duration === null) missingFields.push('duration');

      await log(requestId, 'CREATE_TRIP', 'VALIDATION_ERROR', {
        reason: 'Missing required fields',
        missing: missingFields,
        received: {
          name: !!trimmedName,
          destinationType: !!trimmedType,
          duration: !(duration === undefined || duration === null),
        },
      });

      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    if (!Number.isInteger(duration) || duration < 1) {
      await log(requestId, 'CREATE_TRIP', 'VALIDATION_ERROR', {
        reason: 'Invalid duration value',
        detail: 'duration must be a positive integer',
        received: duration,
      });
      return res.status(400).json({ error: 'duration must be a positive integer' });
    }

    if (checklist && Array.isArray(checklist)) {
      for (const item of checklist) {
        if (!Object.prototype.hasOwnProperty.call(item, 'id') || typeof item.id !== 'string') {
          return res.status(400).json({
            error: 'Invalid checklist payload',
            message: 'Each checklist item must have an "id" string field',
          });
        }
        if (!Object.prototype.hasOwnProperty.call(item, 'name') || typeof item.name !== 'string') {
          return res.status(400).json({
            error: 'Invalid checklist payload',
            message: 'Each checklist item must have a "name" string field',
          });
        }
        if (!Object.prototype.hasOwnProperty.call(item, 'category') || typeof item.category !== 'string') {
          return res.status(400).json({
            error: 'Invalid checklist payload',
            message: 'Each checklist item must have a "category" string field',
          });
        }
        if (!Object.prototype.hasOwnProperty.call(item, 'packed') || typeof item.packed !== 'boolean') {
          return res.status(400).json({
            error: 'Invalid checklist payload',
            message: 'Each checklist item must have a "packed" boolean field',
          });
        }
      }
    }

    const trip = await createTrip({
      name: trimmedName,
      destinationType: trimmedType,
      duration,
      checklist: checklist || [],
      userId: req.user.id,
    });

    await log(requestId, 'CREATE_TRIP', 'SUCCESS', {
      tripId: trip.id,
      name: trip.name,
      destinationType: trip.destinationType,
      itemCount: trip.checklist ? trip.checklist.length : 0,
    });

    res.status(201).json(trip);
  } catch (error) {
    await log(requestId, 'CREATE_TRIP', 'ERROR', {
      reason: error.message,
      errorType: error.constructor.name,
      stack: error.stack.split('\n').slice(0, 3),
    });
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// PUT /api/trips/:tripId - Update trip with checklist
app.put('/api/trips/:tripId', requireAuth, async (req, res) => {
  const requestId = resolveRequestId(req);
  const { tripId } = req.params;

  try {
    const { name, destinationType, duration, checklist } = req.body;

    await log(requestId, 'UPDATE_TRIP', 'START', {
      tripId,
      updates: Object.keys(req.body),
    });

    if (duration !== undefined && (!Number.isInteger(duration) || duration < 1)) {
      await log(requestId, 'UPDATE_TRIP', 'VALIDATION_ERROR', {
        tripId,
        reason: 'Invalid duration value',
        detail: 'duration must be a positive integer',
        received: duration,
      });
      return res.status(400).json({ error: 'duration must be a positive integer' });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: 'name must not be blank' });
    }
    if (destinationType !== undefined && !destinationType.trim()) {
      return res.status(400).json({ error: 'destinationType must not be blank' });
    }

    if (checklist && Array.isArray(checklist)) {
      for (const item of checklist) {
        if (!Object.prototype.hasOwnProperty.call(item, 'id') || typeof item.id !== 'string') {
          return res.status(400).json({
            error: 'Invalid checklist payload',
            message: 'Each checklist item must have an "id" string field',
          });
        }
        if (!Object.prototype.hasOwnProperty.call(item, 'name') || typeof item.name !== 'string') {
          return res.status(400).json({
            error: 'Invalid checklist payload',
            message: 'Each checklist item must have a "name" string field',
          });
        }
        if (!Object.prototype.hasOwnProperty.call(item, 'category') || typeof item.category !== 'string') {
          return res.status(400).json({
            error: 'Invalid checklist payload',
            message: 'Each checklist item must have a "category" string field',
          });
        }
        if (!Object.prototype.hasOwnProperty.call(item, 'packed') || typeof item.packed !== 'boolean') {
          return res.status(400).json({
            error: 'Invalid checklist payload',
            message: 'Each checklist item must have a "packed" boolean field',
          });
        }
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (destinationType !== undefined) updates.destinationType = destinationType.trim();
    if (duration !== undefined) updates.duration = duration;
    if (checklist !== undefined) updates.checklist = checklist;

    const trip = await updateTrip(tripId, updates, req.user.id);

    await log(requestId, 'UPDATE_TRIP', 'SUCCESS', {
      tripId: trip.id,
      name: trip.name,
      destinationType: trip.destinationType,
      duration: trip.duration,
      itemCount: trip.checklist ? trip.checklist.length : 0,
    });

    res.json(trip);
  } catch (error) {
    if (error.code === 'TRIP_NOT_FOUND') {
      await log(requestId, 'UPDATE_TRIP', 'NOT_FOUND', {
        tripId,
        reason: error.message,
      });
      return res.status(404).json({ error: 'Trip not found' });
    }

    await log(requestId, 'UPDATE_TRIP', 'ERROR', {
      tripId,
      reason: error.message,
      errorType: error.constructor.name,
      stack: error.stack.split('\n').slice(0, 3),
    });

    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// DELETE /api/trips/:tripId - Delete a trip
app.delete('/api/trips/:tripId', requireAuth, async (req, res) => {
  const requestId = resolveRequestId(req);
  try {
    await deleteTrip(req.params.tripId, req.user.id);
    res.status(204).end();
  } catch (error) {
    if (error.code === 'TRIP_NOT_FOUND') {
      await log(requestId, 'DELETE_TRIP', 'NOT_FOUND', {
        tripId: req.params.tripId,
      });
      return res.status(404).json({ error: 'Trip not found' });
    }
    await log(requestId, 'DELETE_TRIP', 'ERROR', {
      tripId: req.params.tripId,
      reason: error.message,
      errorType: error.constructor?.name,
      stack: error.stack?.split('\n').slice(0, 3),
    });
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// Swagger UI - serve API documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

if (isProduction) {
  app.use(express.static(distDir));

  app.get(/^\/(?!api\/|auth\/|docs(?:\/|$)|health$).*/, (req, res, next) => {
    const indexPath = path.join(distDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return next();
    }
    return res.sendFile(indexPath);
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', requestId: resolveRequestId(req) });
});

app.use(async (error, req, res, next) => {
  const requestId = resolveRequestId(req);
  await log(requestId, 'UNHANDLED_ERROR', 'ERROR', {
    method: req.method,
    path: req.originalUrl,
    reason: error.message,
    errorType: error.constructor?.name,
    stack: error.stack?.split('\n').slice(0, 3),
  });

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: 'Internal server error',
    requestId,
  });
});

// Export app for testing
export { app };

if (isDirectRun) {
  validateStartupConfig();

  if (isProduction) {
    ensureProductionStorageReady();
  }

  await migrateLatest();

  app.listen(PORT, () => {
    logger.info({
      timestamp: new Date().toISOString(),
      action: 'SERVER_START',
      status: 'SUCCESS',
      details: {
        url: `http://localhost:${PORT}`,
        environment: process.env.NODE_ENV || 'development',
        sqlitePath: getConfiguredDbPath(),
        version: appVersion,
        endpoints: [
          'GET /health',
          'GET /api/trips',
          'GET /api/trips/{tripId}',
          'POST /api/saveTrip',
          'PUT /api/trips/{tripId}',
          'DELETE /api/trips/{tripId}',
        ],
      },
    });
  });
}