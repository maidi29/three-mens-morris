import React, { useCallback, useEffect } from "react";
import socketService from "./services/socketService";
import { useStore } from "./store/store";
import { BASE_API_URL } from "./constants/constants";
import styles from './App.module.scss'
import {Game} from "./components/Game/Game";
import {Start} from "./components/Start/Start";
import toast, { Toaster } from "react-hot-toast";


function App(): JSX.Element {
  const room = useStore((state) => state.room);
  const me = useStore((state) => state.me);

  const connectSocket = async () => {
    await socketService.connect(BASE_API_URL).catch((err) => {
      // tslint:disable-next-line
      console.log("Error: ", err);
      toast('Error while connecting, please reload!', {
          icon: '❗',
          duration: 3000
      });
    });
  };

  const handleBeforeUnload = useCallback(
      (e: BeforeUnloadEvent) => {
        if (!room) return;
        e.preventDefault();
        const message = "Attention, you are leaving the game! This can't be undone!";
        e.returnValue = message;
        return message;
      },
      [room]
  );

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [room, handleBeforeUnload]);

  return (
    <div className={styles.container}>
      <h1>Three Men's Morris</h1>
        {room && me ? (
            <Game />
        ) : <Start/>}
        <Toaster toastOptions={{
            className: styles.toast,
            duration:3000
        }}/>
    </div>
  );
}

export default App;
