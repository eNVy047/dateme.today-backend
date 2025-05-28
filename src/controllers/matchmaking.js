import { Room } from '../models/Room.js';
import { MAX_ROOM_SIZE } from '../config/constants.js';

export class Matchmaker {
  constructor(io) {
    this.io = io;
    this.waitingUsers = new Set();
    this.activeRooms = new Map();
    this.socketToRoom = new Map();
  }

  findMatchFor(socket) {
    if (this.waitingUsers.size > 0) {
      const otherSocketId = this.waitingUsers.values().next().value;
      this.waitingUsers.delete(otherSocketId);
      
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const room = new Room(roomId);
      
      room.addUser(socket.id);
      room.addUser(otherSocketId);
      
      socket.join(roomId);
      this.io.sockets.sockets.get(otherSocketId)?.join(roomId);
      
      this.activeRooms.set(roomId, room);
      this.socketToRoom.set(socket.id, roomId);
      this.socketToRoom.set(otherSocketId, roomId);
      
      this.io.to(roomId).emit('chat_started', { roomId });
      return room;
    } else {
      this.waitingUsers.add(socket.id);
      socket.emit('waiting_for_match');
      return null;
    }
  }
}