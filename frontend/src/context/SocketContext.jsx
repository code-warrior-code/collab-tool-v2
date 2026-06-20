import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket } from '../socket';

const SocketContext = createContext(null);

// Owns the single Socket.io connection for the whole app: opens it once a
// user is authenticated, tears it down on logout, and exposes the instance
// (plus a connected flag) to anything that needs live updates - board/task
// changes, comments, notifications.
export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      return undefined;
    }

    const instance = connectSocket(token);
    setSocket(instance);
    setIsConnected(instance.connected);

    function handleConnect() {
      setIsConnected(true);
    }
    function handleDisconnect() {
      setIsConnected(false);
    }

    instance.on('connect', handleConnect);
    instance.on('disconnect', handleDisconnect);

    return () => {
      instance.off('connect', handleConnect);
      instance.off('disconnect', handleDisconnect);
    };
  }, [token, isAuthenticated]);

  // Close the connection for good when the provider itself unmounts
  // (i.e. the app is closing).
  useEffect(() => {
    return () => disconnectSocket();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return ctx;
}
