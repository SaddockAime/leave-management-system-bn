import app from './app';
import dotenv from 'dotenv';
import http from 'http';
import { initializeSocketService } from './config/socketio';

dotenv.config();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize socket service
const socketService = initializeSocketService(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});