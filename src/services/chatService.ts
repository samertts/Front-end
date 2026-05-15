import io from 'socket.io-client';

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
