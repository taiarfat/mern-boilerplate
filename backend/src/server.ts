/**
 * Server Entry Point
 *
 * This file creates and starts the HTTP server using the Express app.
 * It's the main entry point for the backend application.
 */

import http from "http";

import config from "./constants/config";
import app from "./app";

// Get port from environment variables or use default
const port = config.PORT || 3000;

// Create HTTP server with Express app
const server = http.createServer(app);

// Start the server
server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
