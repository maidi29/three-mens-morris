import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import chatService, { ChatMessage } from "../../../../services/chatService";
import socketService from "../../../../services/socketService";
import { useStore } from "../../../../store/store";

import styles from "./ChatMessages.module.scss";

export const ChatMessages = (): JSX.Element => {
  const me = useStore((state) => state.me);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const messageBoxRef = useRef<HTMLDivElement>(null);

  const handleChatMessages = (): void => {
    if (socketService.socket) {
      chatService.onChatMessageSent(socketService.socket, (message) => {
        setChatMessages((messages) => [...messages, message]);
        if (messageBoxRef.current) {
          messageBoxRef.current?.scrollTo({
            top: messageBoxRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      });
    }
  };

  useEffect(() => {
    handleChatMessages();

    return () => {
      if (socketService.socket) {
        chatService.removeListener(socketService.socket);
      }
    };
  }, []);

  return (
    <div className={styles.messages} ref={messageBoxRef}>
      {chatMessages.map(({ text, id, sender, color }) => (
        <div
          key={id}
          className={classnames(
            styles.messageContainer,
            sender !== me?.id && styles.left
          )}
        >
          <div style={{ color }} className={styles.senderName}>
            {sender === me?.id ? (
              "You"
            ) : (
              <>
                Player
                <span className={styles.sender}>{sender}</span>
              </>
            )}
          </div>
          <div>
            <div className={styles.message}>{text}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
