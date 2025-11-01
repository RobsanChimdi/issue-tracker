import { io } from "socket.io-client";

// Connect to your backend Socket.io server (update port if needed)
export const socket = io("http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
});
