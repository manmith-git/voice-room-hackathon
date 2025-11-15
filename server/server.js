const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const rooms = {}; // room -> Set(socketIds)
const peersMeta = {}; // socketId -> { userId, displayName, role }
const path = require('path');

// Serve web client
app.use('/web-client', express.static(path.join(__dirname, 'web-client')));

// Serve mic helper
app.use('/mic-helper', express.static(path.join(__dirname, 'mic-helper')));


io.on('connection', socket => {
  console.log('socket connected', socket.id);

  socket.on('join-room', ({ room, userId, displayName, role }) => {
    socket.join(room);
    peersMeta[socket.id] = { userId, displayName, role };
    if (!rooms[room]) rooms[room] = new Set();
    rooms[room].add(socket.id);

    // inform others
    socket.to(room).emit('peer-joined', {
      id: socket.id, userId, displayName, role
    });

    // send existing peers to joiner
    const others = Array.from(rooms[room])
      .filter(id => id !== socket.id)
      .map(id => ({ id, ...(peersMeta[id] || {}) }));
    socket.emit('room-peers', others);

    console.log(`${displayName || userId} joined room ${room}`);
  });

  socket.on('signal', (payload) => {
    // payload: { to, from, description?, candidate? }
    if (payload && payload.to) {
      io.to(payload.to).emit('signal', payload);
    }
  });

  socket.on('control', (msg) => {
    // pass control messages to room
    if (msg && msg.room) {
      socket.to(msg.room).emit('control', msg);
    }
  });

  socket.on('disconnecting', () => {
    // remove from rooms and notify
    for (const room of socket.rooms) {
      if (room === socket.id) continue;
      socket.to(room).emit('peer-left', { id: socket.id, userId: peersMeta[socket.id]?.userId });
      if (rooms[room]) {
        rooms[room].delete(socket.id);
        if (rooms[room].size === 0) delete rooms[room];
      }
    }
    delete peersMeta[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Signaling server listening on ${PORT}`));


