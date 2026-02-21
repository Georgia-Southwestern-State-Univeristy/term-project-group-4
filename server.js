import express from 'express';
import {
  getAllTrips,
  createTrip,
  updateTrip
} from './server/storageFile.js';

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

// POST /api/trips - Create new trip with checklist
app.post('/api/saveTrip', async (req, res) => {
  try {
    const { destinationType, duration, checklist } = req.body;
    if (!destinationType || !duration) {
      return res.status(400).json({ error: 'Missing required fields: destinationType, duration' });
    }
    const trip = await createTrip({
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
    const { destinationType, duration, checklist } = req.body;
    const updates = {};
    if (destinationType !== undefined) updates.destinationType = destinationType;
    if (duration !== undefined) updates.duration = duration;
    if (checklist !== undefined) updates.checklist = checklist;
    
    const trip = await updateTrip(req.params.tripId, updates);
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update trip', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Trip Manager API running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET    /api/trips');
  console.log('  POST   /api/saveTrip');
  console.log('  PUT    /api/trips/{tripId}');
});
