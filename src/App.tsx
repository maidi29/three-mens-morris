import React, { useCallback, useEffect } from "react";
import socketService from "./services/socketService";
import {Player, PLAYER, Room, useStore} from "./store/store";
import { BASE_API_URL } from "./constants/constants";
import styles from './App.module.scss'
import {Game} from "./components/Game/Game";
import {Start} from "./components/Start/Start";
import { Link, Route, Routes } from "react-router-dom";
import {PrivacyPolicy} from "./routes/PrivacyPolicy";

interface MainProps {
    room?: Room,
    me?: Player
}
const Main = ({room, me}: MainProps): JSX.Element => (
    <div className={styles.main}>
        <h1>Three Men's Morris</h1>
        {room && me ? (
            <Game />
        ) : <Start/>}
    </div>
);

function App(): JSX.Element {
  const room = useStore((state) => state.room);
  const me = useStore((state) => state.me);

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
        <Routes>
            <Route path="privacyPolicy" element={<PrivacyPolicy />} />
            <Route
                path="*"
                element={
                    <Main
                        room={room}
                        me={me}
                    />
                }
            />
        </Routes>
        <div className={styles.footer}>
            <Link target="_blank" to="/privacyPolicy">
                Privacy Policy
            </Link> |
            <a href="mailto:hi@three-mens-morris.com">Contact</a> |
            <a href="https://buymeacoffee.com/maidi">Buy me a donut</a>
        </div>
    </div>
  );
}

export default App;
