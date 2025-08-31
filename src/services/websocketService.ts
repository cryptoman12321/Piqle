import { EventEmitter } from 'events';

export interface WebSocketMessage {
  type: 'GAME_INVITE' | 'PLAYER_JOINED' | 'PLAYER_LEFT' | 'GAME_UPDATED' | 'TOURNAMENT_INVITE' | 'CHAT_MESSAGE';
  data: any;
  timestamp: number;
  fromUserId?: string;
  toUserId?: string;
  gameId?: string;
  tournamentId?: string;
}

export interface GameInvite {
  gameId: string;
  gameTitle: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  message?: string;
}

export interface PlayerJoined {
  gameId: string;
  playerId: string;
  playerName: string;
  currentPlayers: number;
  maxPlayers: number;
}

class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private userId: string | null = null;

  constructor() {
    super();
  }

  connect(userId: string, token: string) {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    this.userId = userId;

    try {
      // В реальном приложении здесь будет URL вашего WebSocket сервера
      // const wsUrl = `wss://your-websocket-server.com/ws?userId=${userId}&token=${token}`;
      
      // Для демонстрации используем локальный WebSocket сервер
      const wsUrl = `ws://localhost:8080/ws?userId=${userId}&token=${token}`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.emit('disconnected', event);
        
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.isConnecting = false;
      this.emit('error', error);
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId, 'token'); // В реальном приложении нужно передавать актуальный токен
      }
    }, delay);
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('Received WebSocket message:', message);
    
    switch (message.type) {
      case 'GAME_INVITE':
        this.emit('gameInvite', message.data as GameInvite);
        break;
      case 'PLAYER_JOINED':
        this.emit('playerJoined', message.data as PlayerJoined);
        break;
      case 'PLAYER_LEFT':
        this.emit('playerLeft', message.data);
        break;
      case 'GAME_UPDATED':
        this.emit('gameUpdated', message.data);
        break;
      case 'TOURNAMENT_INVITE':
        this.emit('tournamentInvite', message.data);
        break;
      case 'CHAT_MESSAGE':
        this.emit('chatMessage', message.data);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  sendMessage(message: Omit<WebSocketMessage, 'timestamp'>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: Date.now(),
      };
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  sendGameInvite(invite: GameInvite) {
    this.sendMessage({
      type: 'GAME_INVITE',
      data: invite,
      toUserId: invite.toUserId,
      gameId: invite.gameId,
    });
  }

  sendPlayerJoined(gameId: string, playerId: string, playerName: string, currentPlayers: number, maxPlayers: number) {
    this.sendMessage({
      type: 'PLAYER_JOINED',
      data: {
        gameId,
        playerId,
        playerName,
        currentPlayers,
        maxPlayers,
      },
      gameId,
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    this.userId = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Создаем единственный экземпляр сервиса
export const websocketService = new WebSocketService();
