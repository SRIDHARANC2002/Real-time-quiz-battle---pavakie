// small helper for client socket events (optional)
export const joinRoom = (socket, roomId, cb) => {
  if (!socket) return
  socket.emit('joinRoom', { roomId }, cb)
}

export const leaveRoom = (socket, roomId) => {
  if (!socket) return
  socket.emit('leaveRoom', { roomId })
}