import express from 'express';
import {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip
} from './server/storageFile.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerDocument = YAML.load('./docs/api/openapi.yaml');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// GET /api/trips - List all trips
app.get('/api/trips', async (req, res) => {
  try {
    const trips = await getAllTrips();
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips', message: error.message });
  }
});

// GET /api/trips/:tripId - Get a single trip by ID
app.get('/api/trips/:tripId', async (req, res) => {
  try {
    const trip = await getTripById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip', message: error.message });
  }
});

// POST /api/saveTrip - Create new trip with checklist
app.post('/api/saveTrip', async (req, res) => {
  try {
    const { name, destinationType, duration, checklist } = req.body;
    if (!name || !destinationType || duration === undefined || duration === null) {
      return res.status(400).json({ error: 'Missing required fields: name, destinationType, duration' });
    }
    if (!Number.isInteger(duration) || duration < 1) {
      return res.status(400).json({ error: 'duration must be a positive integer' });
    }
    const trip = await createTrip({
      name,
      destinationType,
      duration,
      checklist: checklist || []
    });
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create trip', message: error.message });
  }
});

// PUT /api/trips/{tripId} - Update trip with checklist
app.put('/api/trips/:tripId', async (req, res) => {
  try {
    const { name, destinationType, duration, checklist } = req.body;

    if (duration !== undefined && (!Number.isInteger(duration) || duration < 1)) {
      return res.status(400).json({ error: 'duration must be a positive integer' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (destinationType !== undefined) updates.destinationType = destinationType;
    if (duration !== undefined) updates.duration = duration;
    if (checklist !== undefined) updates.checklist = checklist;

    const trip = await updateTrip(req.params.tripId, updates);
    res.json(trip);
  } catch (error) {
    if (error.code === 'TRIP_NOT_FOUND') {
      return res.status(404).json({ error: 'Trip not found', message: error.message });
    }
    res.status(500).json({ error: 'Failed to update trip', message: error.message });
  }
});

// Swagger UI - serve API documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Export app for testing
export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Trip Manager API running on http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log('  GET    /api/trips');
    console.log('  GET    /api/trips/{tripId}');
    console.log('  POST   /api/saveTrip');
    console.log('  PUT    /api/trips/{tripId}');
  });
}

