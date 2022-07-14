import { nanoid } from "nanoid";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import toast from "react-hot-toast";
import chatService from "../../../../services/chatService";
import socketService from "../../../../services/socketService";
import { useStore } from "../../../../store/store";
import { Input } from "../../../elements/Input/Input";
import styles from "./ChatInput.module.scss";

export const ChatInput = (): JSX.Element => {
  const me = useStore((state) => state.me);
  const [inputValue, setInputValue] = useState("");

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    if (value !== " ") {
      setInputValue(value);
    }
  };

  const handleEnterKey = async (event: KeyboardEvent): Promise<void> => {
    if (
      event.key === "Enter" &&
      socketService.socket &&
      me &&
      inputValue !== " " &&
      inputValue !== ""
    ) {
      try {
        await chatService.sendMessage(socketService.socket, {
          id: nanoid(),
          sender: me.id.toString(),
          text: inputValue,
          color: me.color,
        });
        setInputValue("");
      } catch (error) {
        toast("Could not send message. Please try again later.", {
          icon: "❗",
          duration: 3000,
        });
      }
    }
  };

  return (
    <Input
      value={inputValue}
      className={styles.input}
      type="text"
      name="chatMessage"
      onKeyDown={handleEnterKey}
      onChange={handleMessageChange}
      placeholder="Enter message..."
    />
  );
};
