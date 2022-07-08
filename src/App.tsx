import React, { useEffect } from "react";
import socketService from "./services/socketService";
import { useStore } from "./store/store";
import { BASE_API_URL } from "./constants/constants";
import styles from './App.module.scss'
import { Link, Route, Routes } from "react-router-dom";
import {PrivacyPolicy} from "./routes/PrivacyPolicy";
import toast from "react-hot-toast";
import {Main} from "./components/Main/Main";

export const App = (): JSX.Element => {
  const room = useStore((state) => state.room);
  const me = useStore((state) => state.me);

  const connectSocket = async () => {
    await socketService.connect(BASE_API_URL).catch((err) => {
      toast('Error while connecting, please reload!', {icon: '❗', duration: 3000});
    });
  };

    useEffect(() => {
        void connectSocket();
    }, []);

  /*const handleBeforeUnload = useCallback(
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
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [room, handleBeforeUnload]);*/

  return (
    <div className={styles.container}>
        <Routes>
            <Route path="privacyPolicy" element={<PrivacyPolicy />} />
            <Route path="*" element={<Main room={room} me={me} />} />
        </Routes>
        <div className={styles.footer}>
            <Link target="_blank" to="/privacyPolicy">Privacy Policy</Link> |
            <a href="mailto:hi@three-mens-morris.com">Contact</a> |
            <a href="https://buymeacoffee.com/maidi">Buy me a donut</a>
        </div>
    </div>
  );
}