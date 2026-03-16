# Beta Observability Guide

## Overview

Instructions to access the logs for the Smart Checklist Generator 

**Logging Stack:** [Winston](https://github.com/winstonjs/winston) 

**Environment Configuration**

By deafult dev environment logs info lvel

```bash
# Set log level via environment variable
LOG_LEVEL=error npm run dev:full    # Only errors

# Production mode (no console output)
NODE_ENV=production npm run build
```

## Log Location & How to View Logs

### Log File Location

```
logs/app.log
```

Logs are written to this file in the repository root directory.

### Viewing Logs

**View all logs:**
```bash
cat logs/app.log
```

**Real-time log streaming (tail):**
```bash
tail -f logs/app.log
```

## Logged Events

### 1. Trip Creation (`CREATE_TRIP`)

**When:** User creates a new trip.

**Log entries:**
- `START`: Trip creation started
- `VALIDATION_ERROR`: Missing or invalid fields
- `SUCCESS`: Trip created
- `ERROR`: Unexpected error

**Example:**
```json
{"timestamp":"2026-03-14T10:30:45.123Z","requestId":"...","action":"CREATE_TRIP","status":"START","details":{"name":"Beach Vacation","destinationType":"beach","duration":5}}
{"timestamp":"2026-03-14T10:30:45.245Z","requestId":"...","action":"CREATE_TRIP","status":"SUCCESS","details":{"tripId":"xyz123","name":"Beach Vacation","destinationType":"beach","itemCount":10}}
```

### 2. Get All Trips (`GET_TRIPS`)

**When:** User requests the list of all trips.

**Log entries:**
- `START`: List trips started
- `SUCCESS`: Trips returned (with count)
- `ERROR`: Unexpected error

**Example:**
```json
{"timestamp":"2026-03-14T10:40:00.000Z","requestId":"...","action":"GET_TRIPS","status":"START"}
{"timestamp":"2026-03-14T10:40:00.010Z","requestId":"...","action":"GET_TRIPS","status":"SUCCESS","details":{"count":5}}
```

### 3. Trip Update (`UPDATE_TRIP`)

**When:** User updates a trip or checklist.

**Log entries:**
- `START`: Update started
- `VALIDATION_ERROR`: Invalid data
- `NOT_FOUND`: Trip not found
- `SUCCESS`: Trip updated
- `ERROR`: Unexpected error

**Example:**
```json
{"timestamp":"2026-03-14T10:32:00.789Z","requestId":"...","action":"UPDATE_TRIP","status":"START","details":{"tripId":"xyz123","updates":["checklist"]}}
{"timestamp":"2026-03-14T10:32:00.912Z","requestId":"...","action":"UPDATE_TRIP","status":"SUCCESS","details":{"tripId":"xyz123","name":"Beach Vacation","destinationType":"beach","duration":5,"itemCount":11}}
```


## How to Correlate User Actions to Log Entries

### Request ID Correlation

Every API request is assigned a unique **request ID** (UUID v4). This ID is included in all log entries related to that request, allowing you to trace a single user action across multiple operations.

**How it works:**

1. Client sends request (optionally with `X-Request-ID` header)
2. Server generates or uses provided request ID (UUID v4)
3. All logs for that request use the same `requestId`
4. Frontend receives response with access to the request ID

**Example correlation trace:**

User clicks "Create Trip" with:
- Name: "Beach Vacation"
- Destination: "beach"
- Duration: 5 days

Request ID generated: `a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7a8`

All related logs share this ID:
```
1. TRIP_CREATE START
2. TRIP_CREATE SUCCESS
```

### How to Find Related Logs

**Find all logs for a specific request:**
```bash
cat logs/app.log | jq 'select(.requestId=="a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7a8")'
```

Output example:
```json
{"timestamp":"2026-03-14T10:30:45.123Z","requestId":"a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7a8","action":"TRIP_CREATE","status":"START","details":{...}}
{"timestamp":"2026-03-14T10:30:45.260Z","requestId":"a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7a8","action":"TRIP_CREATE","status":"SUCCESS","details":{...}}
```

### Log Entry Structure

Every log entry contains:

```json
{
  "timestamp": "2026-03-14T10:30:45.123Z",  // ISO 8601 timestamp
  "requestId": "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7a8",  // UUID v4 for correlation
  "action": "TRIP_CREATE",                   // Action category
  "status": "SUCCESS",                       // START, SUCCESS, ERROR, VALIDATION_ERROR, NOT_FOUND
  "details": {                               // Action-specific context
    "tripId": "xyz123",
    "name": "Beach Vacation",
    "destinationType": "beach",
    "itemCount": 10
  }
}
```
