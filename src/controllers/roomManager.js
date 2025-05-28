export class RoomManager {
  constructor(io, matchmaker) {
    this.io = io;
    this.matchmaker = matchmaker;
  }

  cleanupRoom(roomId, socketId) {
    const room = this.matchmaker.activeRooms.get(roomId);
    if (!room) return;

    room.removeUser(socketId);
    this.matchmaker.socketToRoom.delete(socketId);

    if (room.isEmpty()) {
      this.matchmaker.activeRooms.delete(roomId);
    } else {
      const remainingSocketId = room.users.values().next().value;
      this.matchmaker.waitingUsers.add(remainingSocketId);
      this.io.to(remainingSocketId).emit('waiting_for_new_match');
    }
  }

  handlePartnerDisconnect(roomId, disconnectedSocketId) {
    const room = this.matchmaker.activeRooms.get(roomId);
    if (room) {
      room.users.forEach(socketId => {
        if (socketId !== disconnectedSocketId) {
          this.io.to(socketId).emit('partner_disconnected');
        }
      });
      this.cleanupRoom(roomId, disconnectedSocketId);
    }
  }
}