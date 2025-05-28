import { Room } from '../models/Room.js';
import chalk from "chalk";

export class Matchmaker {
  constructor(io) {
    this.io = io;
    this.waitingUsers = new Set();
    this.activeRooms = new Map();
    this.socketToRoom = new Map();
  }

  findMatchFor(socket) {
    // Remove disconnected users from waiting list
    const validWaitingUsers = new Set();
    for (const socketId of this.waitingUsers) {
      if (this.io.sockets.sockets.get(socketId)) {
        validWaitingUsers.add(socketId);
        //console.log(chalk.bgRed`user added bro`);
      }
    }
    this.waitingUsers = validWaitingUsers;

    if (this.waitingUsers.size > 0) {
      // Get first available user
      const otherSocketId = Array.from(this.waitingUsers)[0];
      this.waitingUsers.delete(otherSocketId);
      
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get other socket instance
      const otherSocket = this.io.sockets.sockets.get(otherSocketId);
      if (!otherSocket) {
        // If other user disconnected, try again
        this.findMatchFor(socket);
        return;
      }
      
      // Join both sockets to room
      [socket, otherSocket].forEach(s => {
        s.join(roomId);
        this.socketToRoom.set(s.id, roomId);
        //console.log(chalk.bgRed`user added bro`);
      });
      
      // Create room
      const room = new Room(roomId);
      room.addUser(socket.id);
      room.addUser(otherSocket.id);
      this.activeRooms.set(roomId, room);
      
      // Notify both users
      this.io.to(roomId).emit('chat_started', { roomId });
    } else {
      // No one waiting, add to queue
      this.waitingUsers.add(socket.id);
      socket.on('find_match', () => {
    console.log('Client requested match:', socket.id);
    socket.emit('waiting_for_match');
  });
    }
  }
}