import http from 'http';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { initSocket } from './sockets/socket.js';
import { setSocketServer } from './services/notificationService.js';

const start = async () => {
  await connectDB();
  const app = createApp();
  const server = http.createServer(app);
  const io = initSocket(server);
  setSocketServer(io);

  server.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
};

start().catch((err) => {
  console.error('Startup error', err);
  process.exit(1);
});
