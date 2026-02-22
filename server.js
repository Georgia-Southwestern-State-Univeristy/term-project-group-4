import express from 'express';
import {
  getAllTrips,
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

// POST /api/saveTrip - Create new trip with checklist
app.post('/api/saveTrip', async (req, res) => {
  try {
    const { name, destinationType, duration, checklist } = req.body;
    if (!name || !destinationType || !duration) {
      return res.status(400).json({ error: 'Missing required fields: name, destinationType, duration' });
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
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (destinationType !== undefined) updates.destinationType = destinationType;
    if (duration !== undefined) updates.duration = duration;
    if (checklist !== undefined) updates.checklist = checklist;
    
    const trip = await updateTrip(req.params.tripId, updates);
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update trip', message: error.message });
  }
});

// Export app for testing
export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Trip Manager API running on http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log('  GET    /api/trips');
    console.log('  POST   /api/saveTrip');
    console.log('  PUT    /api/trips/{tripId}');
  });
}
// Swagger UI - serve API documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
