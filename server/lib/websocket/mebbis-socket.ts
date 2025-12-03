import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { logger } from '../../utils/logger.js';
import { mebbisTransferManager } from '../../features/mebbis-transfer/services/mebbis-transfer-manager.service.js';
import { getUserSchoolIds } from '../../features/schools/repository/schools.repository.js';

let io: SocketIOServer | null = null;

export function initializeMEBBISWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    path: '/socket.io',
    pingInterval: 25000,
    pingTimeout: 60000,
    transports: ['websocket', 'polling'],
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    }
  });

  mebbisTransferManager.setSocketIO(io);

  io.on('connection', (socket) => {
    logger.info(`Client connected to MEBBIS socket: ${socket.id}`, 'MEBBISSocket');

    socket.on('mebbis:subscribe', (transferId: string, userId: string, schoolId: string) => {
      try {
        // Validate user has access to this school
        const userSchoolIds = getUserSchoolIds(userId);
        if (!userSchoolIds.includes(schoolId)) {
          logger.warn(`Unauthorized MEBBIS subscription attempt`, 'MEBBISSocket', {
            userId,
            schoolId,
            socketId: socket.id
          });
          socket.emit('mebbis:error', { error: 'Unauthorized school access' });
          return;
        }

        socket.join(`transfer-${transferId}-${schoolId}`);
        logger.info(`Client ${socket.id} subscribed to transfer: ${transferId} for school: ${schoolId}`, 'MEBBISSocket');
        
        const status = mebbisTransferManager.getStatus(transferId);
        if (status) {
          socket.emit('mebbis:progress', status.progress);
        }
      } catch (error) {
        logger.error('Error in mebbis:subscribe', 'MEBBISSocket', error);
        socket.emit('mebbis:error', { error: 'Subscription failed' });
      }
    });

    socket.on('mebbis:unsubscribe', (transferId: string, schoolId: string) => {
      socket.leave(`transfer-${transferId}-${schoolId}`);
      logger.info(`Client ${socket.id} unsubscribed from transfer: ${transferId}`, 'MEBBISSocket');
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected from MEBBIS socket: ${socket.id}`, 'MEBBISSocket');
    });
  });

  logger.info('MEBBIS WebSocket server initialized', 'MEBBISSocket');
  return io;
}

export function getMEBBISSocketIO(): SocketIOServer | null {
  return io;
}
