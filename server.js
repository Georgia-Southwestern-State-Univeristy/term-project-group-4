import express from 'express';
import {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip
} from './server/storageFile.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { log } from './server/logger.js';
import { v4 as uuidv4 } from 'uuid';

const swaggerDocument = YAML.load('./docs/api/openapi.yaml');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// GET /api/trips - List all trips
app.get('/api/trips', async (req, res) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  try {
    await log(requestId, 'GET_TRIPS', 'START');
    const trips = await getAllTrips();
    await log(requestId, 'GET_TRIPS', 'SUCCESS', { count: trips.length });
    res.json(trips);
  } catch (error) {
    await log(requestId, 'GET_TRIPS', 'ERROR', {
      reason: error.message,
      errorType: error.constructor?.name,
      stack: error.stack?.split('\n').slice(0, 3)
    });
    res.status(500).json({ error: 'Failed to fetch trips', message: error.message });
  }
});

// GET /api/trips/:tripId - Get a single trip by ID
app.get('/api/trips/:tripId', async (req, res) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  const { tripId } = req.params;
  
  try {
    const trip = await getTripById(tripId);
    if (!trip) {
      await log(requestId, 'GET_TRIP', 'NOT_FOUND', {
        tripId,
        reason: 'Trip does not exist'
      });
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    await log(requestId, 'GET_TRIP', 'SUCCESS', {
      tripId: trip.id,
      name: trip.name,
      destinationType: trip.destinationType,
      duration: trip.duration,
      itemCount: trip.checklist ? trip.checklist.length : 0
    });
    
    res.json(trip);
  } catch (error) {
    await log(requestId, 'GET_TRIP', 'ERROR', {
      tripId,
      reason: error.message,
      errorType: error.constructor.name,
      stack: error.stack.split('\n').slice(0, 3)
    });
    res.status(500).json({ error: 'Failed to fetch trip', message: error.message });
  }
});

// POST /api/saveTrip - Create new trip with checklist
// Request: { name, destinationType, duration, checklist[] }
// Checklist items must have: { id, name, category, packed }
app.post('/api/saveTrip', async (req, res) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  try {
    const { name, destinationType, duration, checklist } = req.body;
    
    await log(requestId, 'CREATE_TRIP', 'START', {
      name,
      destinationType,
      duration
    });
    
    if (!name || !destinationType || duration === undefined || duration === null) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!destinationType) missingFields.push('destinationType');
      if (duration === undefined || duration === null) missingFields.push('duration');
      
      await log(requestId, 'CREATE_TRIP', 'VALIDATION_ERROR', {
        reason: 'Missing required fields',
        missing: missingFields,
        received: { name: !!name, destinationType: !!destinationType, duration: !(duration === undefined || duration === null) }
      });
      
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }
    if (!Number.isInteger(duration) || duration < 1) {
      await log(requestId, 'CREATE_TRIP', 'VALIDATION_ERROR', {
        reason: 'Invalid duration value',
        detail: 'duration must be a positive integer',
        received: duration
      });
      return res.status(400).json({ error: 'duration must be a positive integer' });
    }
    
    // Validate checklist payload structure if provided
    if (checklist && Array.isArray(checklist)) {
      for (const item of checklist) {
        if (!item.hasOwnProperty('id') || typeof item.id !== 'string') {
          return res.status(400).json({ 
            error: 'Invalid checklist payload', 
            message: 'Each checklist item must have an "id" string field' 
          });
        }
        if (!item.hasOwnProperty('name') || typeof item.name !== 'string') {
          return res.status(400).json({ 
            error: 'Invalid checklist payload', 
            message: 'Each checklist item must have a "name" string field' 
          });
        }
        if (!item.hasOwnProperty('category') || typeof item.category !== 'string') {
          return res.status(400).json({ 
            error: 'Invalid checklist payload', 
            message: 'Each checklist item must have a "category" string field' 
          });
        }
        if (!item.hasOwnProperty('packed') || typeof item.packed !== 'boolean') {
          return res.status(400).json({ 
            error: 'Invalid checklist payload', 
            message: 'Each checklist item must have a "packed" boolean field' 
          });
        }
      }
    }
    
    const trip = await createTrip({
      name,
      destinationType,
      duration,
      checklist: checklist || []
    });
    
    await log(requestId, 'CREATE_TRIP', 'SUCCESS', {
      tripId: trip.id,
      name: trip.name,
      destinationType: trip.destinationType,
      itemCount: trip.checklist ? trip.checklist.length : 0
    });
    
    res.status(201).json(trip);
  } catch (error) {
    await log(requestId, 'CREATE_TRIP', 'ERROR', {
      reason: error.message,
      errorType: error.constructor.name,
      stack: error.stack.split('\n').slice(0, 3)
    });
    res.status(500).json({ error: 'Failed to create trip', message: error.message });
  }
});

// PUT /api/trips/{tripId} - Update trip with checklist
// Checklist items must have: { id, name, category, packed }
app.put('/api/trips/:tripId', async (req, res) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  const { tripId } = req.params;
  
  try {
    const { name, destinationType, duration, checklist } = req.body;
    
    await log(requestId, 'UPDATE_TRIP', 'START', {
      tripId,
      updates: Object.keys(req.body)
    });

    if (duration !== undefined && (!Number.isInteger(duration) || duration < 1)) {
      await log(requestId, 'UPDATE_TRIP', 'VALIDATION_ERROR', {
        tripId,
        reason: 'Invalid duration value',
        detail: 'duration must be a positive integer',
        received: duration
      });
      return res.status(400).json({ error: 'duration must be a positive integer' });
    }
    
    // Validate checklist payload structure if provided
    if (checklist && Array.isArray(checklist)) {
      for (const item of checklist) {
        if (!item.hasOwnProperty('id') || typeof item.id !== 'string') {
          return res.status(400).json({ 
            error: 'Invalid checklist payload', 
            message: 'Each checklist item must have an "id" string field' 
          });
        }
        if (!item.hasOwnProperty('name') || typeof item.name !== 'string') {
          return res.status(400).json({ 
            error: 'Invalid checklist payload', 
            message: 'Each checklist item must have a "name" string field' 
          });
        }
        if (!item.hasOwnProperty('category') || typeof item.category !== 'string') {
          return res.status(400).json({ 
            error: 'Invalid checklist payload', 
            message: 'Each checklist item must have a "category" string field' 
          });
        }
        if (!item.hasOwnProperty('packed') || typeof item.packed !== 'boolean') {
          return res.status(400).json({ 
            error: 'Invalid checklist payload', 
            message: 'Each checklist item must have a "packed" boolean field' 
          });
        }
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (destinationType !== undefined) updates.destinationType = destinationType;
    if (duration !== undefined) updates.duration = duration;
    if (checklist !== undefined) updates.checklist = checklist;

    const trip = await updateTrip(req.params.tripId, updates);
    
    await log(requestId, 'UPDATE_TRIP', 'SUCCESS', {
      tripId: trip.id,
      name: trip.name,
      destinationType: trip.destinationType,
      duration: trip.duration,
      itemCount: trip.checklist ? trip.checklist.length : 0
    });
    
    res.json(trip);
  } catch (error) {
    if (error.code === 'TRIP_NOT_FOUND') {
      await log(requestId, 'UPDATE_TRIP', 'NOT_FOUND', {
        tripId,
        reason: error.message
      });
      return res.status(404).json({ error: 'Trip not found', message: error.message });
    }
    
    await log(requestId, 'UPDATE_TRIP', 'ERROR', {
      tripId,
      reason: error.message,
      errorType: error.constructor.name,
      stack: error.stack.split('\n').slice(0, 3)
    });
    
    res.status(500).json({ error: 'Failed to update trip', message: error.message });
  }
});

// DELETE /api/trips/:tripId - Delete trip
app.delete('/api/trips/:tripId', async (req, res) => {
  try {
    await deleteTrip(req.params.tripId);
    res.status(204).send();
  } catch (error) {
    if (error.code === 'TRIP_NOT_FOUND') {
      return res.status(404).json({ error: 'Trip not found', message: error.message });
    }

    res.status(500).json({ error: 'Failed to delete trip', message: error.message });
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

