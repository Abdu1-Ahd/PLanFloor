import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// In-memory store
// rooms[roomCode] = { password, shapes: [], users: [] }
const rooms = {};

// Helper to generate a short room code
const generateRoomCode = () => {
  let code;
  do {
    code = 'LL-' + Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms[code]);
  return code;
};

// Colors for PFPs
const pfpColors = ['#F3E37C', '#F3D34A', '#EEA243', '#F3A738', '#A7F1D9', '#D9A7F1', '#F1A7A7'];

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  let currentRoom = null;

  socket.on('create_room', ({ roomCode: clientRoomCode, storeName, password, initial }, callback) => {
    const roomCode = clientRoomCode || generateRoomCode();
    const color = pfpColors[Math.floor(Math.random() * pfpColors.length)];
    const user = { id: socket.id, initial: initial.substring(0, 2).toUpperCase(), color };

    rooms[roomCode] = {
      password,
      shapes: [],
      users: [user],
      storeName
    };

    socket.join(roomCode);
    currentRoom = roomCode;
    
    console.log(`Room created: ${roomCode} by ${socket.id}`);
    callback({ success: true, roomCode, shapes: [], users: rooms[roomCode].users });
  });

  socket.on('join_room', ({ roomCode, password, initial }, callback) => {
    const room = rooms[roomCode];
    if (!room) {
      return callback({ success: false, error: 'Room not found.' });
    }
    if (room.password !== password) {
      return callback({ success: false, error: 'Incorrect password.' });
    }

    const color = pfpColors[Math.floor(Math.random() * pfpColors.length)];
    const user = { id: socket.id, initial: initial.substring(0, 2).toUpperCase(), color };
    
    room.users.push(user);
    socket.join(roomCode);
    currentRoom = roomCode;

    console.log(`User ${socket.id} joined ${roomCode}`);
    
    // Broadcast to others that a user joined
    socket.to(roomCode).emit('users_updated', room.users);
    
    // Explicitly emit initial_state to the joining client so it can render preexisting fixtures
    socket.emit('initial_state', room.shapes);
    
    // Send current state to the joining user via callback
    callback({ success: true, shapes: room.shapes, users: room.users, storeName: room.storeName });
  });

  socket.on('shape_add', (shape) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    rooms[currentRoom].shapes.push(shape);
    socket.to(currentRoom).emit('shape_added', shape);
  });

  socket.on('shape_update', ({ id, newAttrs }) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    const shapeIndex = room.shapes.findIndex((s) => s.id === id);
    if (shapeIndex !== -1) {
      room.shapes[shapeIndex] = { ...room.shapes[shapeIndex], ...newAttrs };
      socket.to(currentRoom).emit('shape_updated', { id, newAttrs });
    }
  });

  socket.on('clear_canvas', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    rooms[currentRoom].shapes = [];
    socket.to(currentRoom).emit('canvas_cleared');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (currentRoom && rooms[currentRoom]) {
      const room = rooms[currentRoom];
      room.users = room.users.filter((u) => u.id !== socket.id);
      
      if (room.users.length === 0) {
        // Optional: Clean up empty rooms after some time, or delete immediately
        // delete rooms[currentRoom];
      } else {
        io.to(currentRoom).emit('users_updated', room.users);
      }
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`LayoutLive Server running on port ${PORT}`);
});
