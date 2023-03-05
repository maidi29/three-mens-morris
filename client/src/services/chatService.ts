import { Socket } from "socket.io-client";
import { PLAYER } from "./../store/store";

export interface ChatMessageInternal {
  id: string;
  sender: string;
  text: string;
  color: string;
}

export interface ChatMessage extends Omit<ChatMessageInternal, "sender"> {
  sender: PLAYER;
}

class ChatService {
  public async sendMessage(
    socket: Socket,
    message: ChatMessageInternal
  ): Promise<void> {
    socket.emit("chat_message_sent", message);
  }

  public async onChatMessageSent(
    socket: Socket,
    listener: (message: ChatMessage) => void
  ): Promise<void> {
    socket.on("on_chat_message_sent", (message: ChatMessageInternal) => {
      listener({
        ...message,
        sender: +message.sender,
      });
    });
  }

  public removeListener(socket: Socket): void {
    socket.off("on_chat_message_sent");
  }
}

export default new ChatService();
