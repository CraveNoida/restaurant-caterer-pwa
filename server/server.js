import "dotenv/config";
import http from "node:http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { configureSocket } from "./socket.js";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
configureSocket(server, app);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    if (process.env.ALLOW_OFFLINE_ADMIN_LOGIN === "true") {
      console.warn("Starting API without MongoDB. Offline admin login is enabled for local development.");
      server.listen(PORT, () => {
        console.log(`API server running on port ${PORT}`);
      });
      return;
    }

    process.exit(1);
  });
