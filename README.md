# term-project-group-4

A Node.js-based project that includes automated testing and code linting to ensure code quality and consistency.

## Prerequisites

This project requires Node.js v24 LTS (Long Term Support). Download and install from the [official Node.js website](https://nodejs.org/).

## Getting Started

1. Clone the project
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project root directory
   ```bash
   cd term-project-group-4
   ```

3. Install project dependencies
   ```bash
   npm install
   ```

## Running Locally

The app has two parts: a **Vite frontend** (serves the UI) and an **Express API server** (handles trip data storage). Both must be running for full functionality.

### Quick Start (both servers)

Run the frontend and backend together in a single terminal:
```bash
npm run dev:full
```
Then open `http://localhost:5173` in your browser.

### Running Separately

If you prefer separate terminals:

**Terminal 1 — Express API Server:**
```bash
npm run server
```
Starts the API at `http://localhost:3000`.

**Terminal 2 — Vite Frontend:**
```bash
npm run dev
```
Starts the UI at `http://localhost:5173` with hot reloading. API requests are automatically proxied to the Express server.

### API Endpoints

- `GET /api/trips` - List all saved trips
- `POST /api/saveTrip` - Create/save a new trip with checklist
- `PUT /api/trips/{tripId}` - Update an existing trip

Trip data is persisted to `data/trips.json`.

### Verify It Works

1. Run `npm run dev:full`
2. Open `http://localhost:5173`
3. Enter a trip name, select a destination type, and set a duration
4. Click **Generate Checklist** to create a packing list
5. Click **Save Trip** to persist the trip to the server
6. Confirm the button shows "Saved!" with a trip ID
7. Check `data/trips.json` to verify the trip was written to disk

### API Documentation (Swagger UI)
After installing the server (`npm run server`), the OpenAPI documentation is available at:

- http://localhost:3000/docs


## Development Commands

- **Lint Code**: Check for code quality issues
  ```bash
  npm run lint
  ```

- **Run Tests**: Execute the test suite
  ```bash
  npm run test
  ```

- **Build for Production**: Create an optimized build in the `dist/` folder
  ```bash
  npm run build
  ```

- **Preview Production Build**: Serve the production build locally
  ```bash
  npm run preview
  ```

- **Seed Sample Data**: Populate the database with demo trips and checklists
  ```bash
  npm run seed
  ```
  This creates sample data at `data/trips.json` with 3 realistic trips (beach, mountain, city) ready for testing.

### Reinstall Dependencies
If you encounter dependency issues, reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```
