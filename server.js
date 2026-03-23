import express from 'express';
import {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  migrateLatest,
} from './server/storage.js';
import { requireAuth } from './server/auth.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
// keep your other imports as-is

const app = express();

// keep your existing middleware setup as-is

app.get('/api/trips', requireAuth, async (req, res) => {
  try {
    const trips = await getAllTrips(req.user.id);
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips', message: error.message });
  }
});

app.get('/api/trips/:tripId', requireAuth, async (req, res) => {
  try {
    const trip = await getTripById(req.params.tripId, req.user.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip', message: error.message });
  }
});

app.post('/api/saveTrip', requireAuth, async (req, res) => {
  try {
    const tripParams = {
      name: req.body.name?.trim(),
      destinationType: req.body.destinationType?.trim?.() ?? req.body.destinationType,
      duration: req.body.duration,
      checklist: req.body.checklist,
      userId: req.user.id,
    };

    // keep your existing validation logic here
    const trip = await createTrip(tripParams);
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save trip', message: error.message });
  }
});

app.put('/api/trips/:tripId', requireAuth, async (req, res) => {
  try {
    const updates = {
      ...req.body,
      ...(req.body.name !== undefined ? { name: req.body.name.trim() } : {}),
      ...(req.body.destinationType !== undefined
        ? { destinationType: req.body.destinationType.trim?.() ?? req.body.destinationType }
        : {}),
    };

    // keep your existing validation logic here
    const trip = await updateTrip(req.params.tripId, req.user.id, updates);
    res.json(trip);
  } catch (error) {
    if (error.code === 'TRIP_NOT_FOUND') {
      return res.status(404).json({ error: 'Trip not found', message: error.message });
    }
    res.status(500).json({ error: 'Failed to update trip', message: error.message });
  }
});

app.delete('/api/trips/:tripId', requireAuth, async (req, res) => {
  try {
    await deleteTrip(req.params.tripId, req.user.id);
    res.status(204).end();
  } catch (error) {
    if (error.code === 'TRIP_NOT_FOUND') {
      return res.status(404).json({ error: 'Trip not found', message: error.message });
    }
    res.status(500).json({ error: 'Failed to delete trip', message: error.message });
  }
});

// keep your startup / migrateLatest block as-is
export { app };