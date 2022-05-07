import React, { useCallback, useEffect } from "react";
import socketService from "./services/socketService";
import { useStore } from "./store/store";
import { BASE_API_URL } from "./constants/constants";
import styles from './App.module.scss'
import {Game} from "./components/Game/Game";


function App(): JSX.Element {
  const room = useStore((state) => state.room);

  const connectSocket = async () => {
    await socketService.connect(BASE_API_URL).catch((err) => {
      // tslint:disable-next-line
      console.log("Error: ", err);
    });
  };

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (!room) return;
      e.preventDefault();
      const message = "Are you sure you want to leave the room? This action can't be undone!";
      e.returnValue = message;
      return message;
    },
    [room]
  );

  useEffect(() => {
    //connectSocket();
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
        <Game/>
    </div>
  );
}

export default App;
