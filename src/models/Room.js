export class Room {
  constructor(roomId) {
    this.id = roomId;
    this.users = new Set();
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
  }

  addUser(socketId) {
    this.users.add(socketId);
    this.updateActivity();
  }

  removeUser(socketId) {
    this.users.delete(socketId);
    this.updateActivity();
  }

  isEmpty() {
    return this.users.size === 0;
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }
}