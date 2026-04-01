import { Server } from 'socket.io';
import { config } from '../config/env.js';

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: config.clientUrl, methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    socket.on('join:user', (userId) => {
      socket.join(String(userId));
    });
  });

  return io;
};
