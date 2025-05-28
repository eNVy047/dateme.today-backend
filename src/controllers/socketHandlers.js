export class SocketHandler {
  constructor(io, matchmaker, roomManager, rateLimiter) {
    this.io = io;
    this.matchmaker = matchmaker;
    this.roomManager = roomManager;
    this.rateLimiter = rateLimiter;
  }

  initializeSocketEvents(socket) {
    // Initial connection
    this.matchmaker.findMatchFor(socket);

    // Message handling
    socket.on('send_message', (data) => {
      if (!this.rateLimiter.checkLimit(socket.id)) {
        socket.emit('error', 'Message rate limit exceeded');
        return;
      }

      const roomId = this.matchmaker.socketToRoom.get(socket.id);
      if (roomId) {
        socket.to(roomId).emit('receive_message', {
          sender: socket.id,
          message: data.message
        });
      }
    });

    // Next partner request
    socket.on('next', () => {
      const roomId = this.matchmaker.socketToRoom.get(socket.id);
      if (roomId) {
        const room = this.matchmaker.activeRooms.get(roomId);
        if (room) {
          room.users.forEach(socketId => {
            if (socketId !== socket.id) {
              this.io.to(socketId).emit('partner_left');
            }
          });
        }
        this.roomManager.cleanupRoom(roomId, socket.id);
      }
      this.matchmaker.findMatchFor(socket);
    });

    // Disconnection
    socket.on('disconnect', () => {
      this.matchmaker.waitingUsers.delete(socket.id);
      const roomId = this.matchmaker.socketToRoom.get(socket.id);
      if (roomId) {
        this.roomManager.handlePartnerDisconnect(roomId, socket.id);
      }
      this.rateLimiter.resetCount(socket.id);
    });
  }
}