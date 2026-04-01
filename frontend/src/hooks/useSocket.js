import { useEffect } from 'react';
import { io } from 'socket.io-client';

let socket;

export const useSocket = (userId, onNotification) => {
  useEffect(() => {
    if (!userId) return undefined;
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.emit('join:user', userId);
    socket.on('notification:new', onNotification);

    return () => {
      socket.off('notification:new', onNotification);
      socket.disconnect();
    };
  }, [userId, onNotification]);
};
