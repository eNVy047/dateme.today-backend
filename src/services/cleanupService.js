export class CleanupService {
  constructor(matchmaker) {
    this.matchmaker = matchmaker;
  }

  cleanupDisconnectedSocket(socketId) {
    // Remove from waiting list
    this.matchmaker.waitingUsers.delete(socketId);
    
    // Handle room cleanup if in a room
    const roomId = this.matchmaker.socketToRoom.get(socketId);
    if (roomId) {
      const room = this.matchmaker.activeRooms.get(roomId);
      if (room) {
        room.removeUser(socketId);
        this.matchmaker.socketToRoom.delete(socketId);
        
        if (room.users.size === 0) {
          this.matchmaker.activeRooms.delete(roomId);
        } else {
          // Notify remaining user
          const remainingUserId = room.users.values().next().value;
          this.matchmaker.waitingUsers.add(remainingUserId);
          this.matchmaker.io.to(remainingUserId).emit('partner_disconnected');
        }
      }
    }
  }
}