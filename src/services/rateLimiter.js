import { MESSAGE_RATE_LIMIT } from '../config/constants.js';

export class RateLimiter {
  constructor() {
    this.userMessageCounts = new Map();
  }

  checkLimit(socketId) {
    const count = this.userMessageCounts.get(socketId) || 0;
    if (count >= MESSAGE_RATE_LIMIT) {
      return false;
    }
    this.userMessageCounts.set(socketId, count + 1);
    return true;
  }

  resetCount(socketId) {
    this.userMessageCounts.delete(socketId);
  }
}