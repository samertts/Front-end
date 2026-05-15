import * as socketIo from 'socket.io-client';

const io = (socketIo as any).default || (socketIo as any).io || socketIo;

class ChatService {
  private socket: any = null;
  private currentRoomId: string | null = null;

  connect() {
    if (this.socket?.connected) return;
    
    this.socket = io(window.location.origin);

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      if (this.currentRoomId) {
        this.socket?.emit('join_room', this.currentRoomId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }

  joinRoom(roomId: string) {
    this.currentRoomId = roomId;
    if (this.socket?.connected) {
      this.socket.emit('join_room', roomId);
    }
  }

  sendMessage(data: { roomId: string, message: string, senderId: string, senderName: string, type?: string }) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', data);
    }
  }

  sendTyping(roomId: string, userId: string, typing: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { roomId, userId, typing });
    }
  }

  onTyping(callback: (data: { userId: string, typing: boolean }) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  sendCallSignal(roomId: string, signal: any, type: 'voice' | 'video') {
    if (this.socket?.connected) {
      this.socket.emit('call_signal', { roomId, signal, type });
    }
  }

  onIncomingCall(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('incoming_call', callback);
    }
  }

  onCallAccepted(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('call_accepted', callback);
    }
  }

  onMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  offMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('receive_message', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const chatService = new ChatService();
