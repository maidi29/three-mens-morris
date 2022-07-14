import { ChatInput } from "./ChatInput/ChatInput";
import { ChatMessages } from "./ChatMessages/ChatMessages";

import styles from "./Chat.module.scss";

export const Chat = (): JSX.Element => {
  return (
    <div className={styles.container}>
      <h3 className={styles.headline}>Chat</h3>
      <ChatMessages />
      <ChatInput />
    </div>
  );
};
