export class User {
  constructor(socketId) {
    this.id = socketId;
    this.messageCount = 0;
    this.joinedAt = Date.now();
  }

  incrementMessageCount() {
    this.messageCount++;
  }

  resetMessageCount() {
    this.messageCount = 0;
  }
}