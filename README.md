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

Start the Vite development server:
```bash
npm run dev
```
This launches the app at `http://localhost:5173` with hot reloading.

### Backend (Express API Server)
Start the Express server to enable trip storage and data persistence:
```bash
npm run server
```
The API will run at `http://localhost:3000` with the following endpoints:
- `GET /api/trips` - List all saved trips
- `POST /api/saveTrip` - Create/save a new trip with checklist
- `PUT /api/trips/{tripId}` - Update an existing trip
- `GET /health` - Health check endpoint

Data is persisted to `data/trips.json`.

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

### Reinstall Dependencies
If you encounter dependency issues, reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```
