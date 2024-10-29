import { injectable, inject } from 'inversify';
import { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';

import { TYPES } from 'di/types';
import { AuthService } from './auth.service';

@injectable()
export class SocketService {
  private io: SocketIOServer;

  constructor(
    @inject(TYPES.Server)
    httpServer: HttpServer,
    @inject(TYPES.AuthService)
    private authService: AuthService,
  ) {
    // Initialize Socket.IO with the provided HTTP server
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // Allow all origins (configure as needed for your environment)
        methods: ['GET', 'POST'],
      },
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public setupListeners(): void {
    this.io.on('connection', async (socket) => {
      logger.log('----------------------------------------');
      logger.log(`Socket client connected: ${socket.id}`);
      logger.log('----------------------------------------');
      // Access request headers through socket.handshake.headers
      const accessToken = socket.handshake.query.authorization as string;

      // Validate the token (if needed)
      const { decoded, error } =
        await this.authService.validateJWT(accessToken);
      if (error) {
        socket.disconnect(); // Disconnect if the token is invalid
      }

      // Join a chat room based on the id
      socket.on('joinRoom', async (chatId: string) => {
        socket.join(chatId);
        // find and update
        // Broadcast to the room that a new user has joined
        socket.broadcast.to(chatId).emit('userJoined', {
          senderId: decoded?.sub,
          sender: {
            id: decoded?.sub || '',
            firstName: decoded?.username.split(' ')[0] || '',
            lastName: decoded?.username.split(' ')[1] || '',
          },
          timestamp: new Date().toISOString(),
          message: `${decoded?.username} has joined.`,
        });
      });

      // Leave a room
      socket.on('leaveRoom', (chatId: string) => {
        socket.leave(chatId);
        socket.broadcast.to(chatId).emit('userLeft', {
          senderId: decoded?.sub,
          sender: {
            id: decoded?.sub || '',
            firstName: decoded?.username.split(' ')[0] || '',
            lastName: decoded?.username.split(' ')[1] || '',
          },
          timestamp: new Date().toISOString(),
          message: `${decoded?.username} has left`,
        });
      });

      // Handle messages within a room
      socket.on('message', async ({ chatId, message }) => {
        const timestamp = new Date();
        // Emit message to all users in the room
        this.io.to(chatId).emit('message', {
          senderId: decoded?.sub,
          sender: {
            id: decoded?.sub || '',
            firstName: decoded?.username.split(' ')[0] || '',
            lastName: decoded?.username.split(' ')[1] || '',
          },
          message,
          timestamp: timestamp.toISOString(),
        });
      });

      // Handle messages within a room
      socket.on('isTyping', ({ chatId, isTyping }) => {
        // Emit to all users in the room except for the sender
        socket.broadcast.to(chatId).emit('isUserTyping', {
          message: isTyping ? `${decoded?.username} is typing...` : '',
        });
      });

      socket.on('disconnect', () => {
        logger.log('----------------------------------------');
        logger.log(`Socket client disconnected: ${socket.id}`);
        logger.log('----------------------------------------');
      });
    });
  }
}
