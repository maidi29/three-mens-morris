import React, { useCallback, useEffect } from "react";
import socketService from "./services/socketService";
import { useStore } from "./store/store";
import { BASE_API_URL } from "./constants/constants";
import styles from './App.module.scss'
import {Game} from "./components/Game/Game";
import {Start} from "./components/Start/Start";


function App(): JSX.Element {
  const room = useStore((state) => state.room);

  const connectSocket = async () => {
    await socketService.connect(BASE_API_URL).catch((err) => {
      // tslint:disable-next-line
      console.log("Error: ", err);
    });
  };

  useEffect(() => {
    connectSocket();
  }, []);

  return (
    <div className={styles.container}>
      <h1>Three Men's Morris</h1>
        {room ? (
            <Game />
        ) : <Start/>}
    </div>
  );
}

export default App;
