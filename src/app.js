
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { CleanupService } from './services/cleanupService.js';
import { Matchmaker } from './controllers/matchmaking.js';
import { RoomManager } from './controllers/roomManager.js';
import { RateLimiter } from './services/rateLimiter.js';
import { SocketHandler } from './controllers/socketHandlers.js';

export function createApp() {
  const app = express();
  
  // Middleware
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }));

  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    }
  });

  // Initiaze serviice classses
  const matchmaker = new Matchmaker(io);
  const roomManager = new RoomManager(io, matchmaker);
  const rateLimiter = new RateLimiter();
  const socketHandler = new SocketHandler(io, matchmaker, roomManager, rateLimiter);
  const cleanupService = new CleanupService(matchmaker);
  // Hadle soket connetions
io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);
  socketHandler.initializeSocketEvents(socket);

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    cleanupService.cleanupDisconnectedSocket(socket.id);
  });
});



  return { app, server };
}
