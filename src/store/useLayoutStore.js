import { create } from 'zustand';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const useLayoutStore = create((set, get) => {
  
  socket.on('shape_added', (shape) => {
    set((state) => ({ shapes: [...state.shapes, shape] }));
    get().triggerSync();
  });

  socket.on('shape_updated', ({ id, newAttrs }) => {
    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...newAttrs } : shape
      ),
    }));
    get().triggerSync();
  });

  socket.on('users_updated', (users) => {
    set({ users });
  });

  socket.on('canvas_cleared', () => {
    set({ shapes: [], selectedId: null });
  });

  socket.on('initial_state', (savedFixtures) => {
    set({ shapes: [...savedFixtures] });
    get().triggerSync();
  });

  return {
    shapes: [],
    selectedId: null,
    isLiveConnected: false,
    isSyncing: false,
    roomCode: null,
    storeName: null,
    users: [],

    setLiveConnected: (status) => set({ isLiveConnected: status }),

    triggerSync: () => {
      set({ isSyncing: true });
      setTimeout(() => {
        set({ isSyncing: false });
      }, 800);
    },

    addShape: (shape) => {
      set((state) => ({
        shapes: [...state.shapes, shape],
        selectedId: shape.id,
      }));
      socket.emit('shape_add', shape);
      get().triggerSync();
    },

    updateShape: (id, newAttrs) => {
      set((state) => ({
        shapes: state.shapes.map((shape) =>
          shape.id === id ? { ...shape, ...newAttrs } : shape
        ),
      }));
      socket.emit('shape_update', { id, newAttrs });
      get().triggerSync();
    },

    clearCanvas: () => {
      set({ shapes: [], selectedId: null });
      socket.emit('clear_canvas');
    },

    selectShape: (id) => set({ selectedId: id }),

    createRoom: (roomCode, storeName, password, initial) => {
      return new Promise((resolve) => {
        socket.emit('create_room', { roomCode, storeName, password, initial }, (res) => {
          if (res.success) {
            set({ roomCode: res.roomCode, shapes: res.shapes, users: res.users, storeName, isLiveConnected: true });
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    },

    joinRoom: (roomCode, password, initial) => {
      return new Promise((resolve) => {
        socket.emit('join_room', { roomCode, password, initial }, (res) => {
          if (res.success) {
            set({ roomCode, shapes: res.shapes, users: res.users, storeName: res.storeName, isLiveConnected: true });
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    }
  };
});

export default useLayoutStore;
