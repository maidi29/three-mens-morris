import React, { useEffect, useRef, useState } from "react";
import {Player, Room, useStore} from "../../store/store";
import styles from './Start.module.scss';
import socketService from "../../services/socketService";
import gameService from "../../services/gameService";


export function Start({ }): JSX.Element {
  const { setRoom, setOpponent, setMe } = useStore();
  const [playerId, setPlayerId] = useState<0 | 1>();
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
    const value = e.target.value;
    setRoomName(value);
  };

  const start = async (e: React.FormEvent) => {
    e.preventDefault();

    const socket = socketService.socket;
    // if (!playerName || playerName.trim() === "" || !socket) return;
    if(!socket) return;

    if (playerId === 1 && !roomName) return;
    let roomInfo;
    let roomId;

    const ownPlayer: Player = {
      symbol: "",
      id: playerId || 0,
      color: "",
      score: 0
    };

    setIsCreating(true);
    if (playerId === 1) {
      roomInfo = await gameService
          .joinGameRoom(socket, { player: ownPlayer, roomId: roomName })
          .catch((err) => {
              console.log(err)
          });
      if (roomInfo) {
        setRoom({ roomId: roomName });
        setOpponent(roomInfo.opponent);
      }
    } else {
      roomId = await gameService
          .createGameRoom(socket, ownPlayer)
          .catch((err) => console.log(err));
      console.log(roomId);
      if (roomId) {
        setRoom({ roomId });
      }
    }
    setMe(ownPlayer);
    setIsCreating(false);
  };


  return (
      <div className={styles.start}>
        <form onSubmit={start}>

        {playerId === 1 && (
            <input
                maxLength={5}
                placeholder="Room ID"
                value={roomName}
                onChange={handleRoomNameChange}
            />
        )}
        <button className="button" type="submit" disabled={isCreating}>
          {playerId === 1
              ? `Join Room${isCreating ? "..." : ""}`
              : `Host Room${isCreating ? "..." : ""}`}
        </button>
        {playerId !== 1 && (
            <button
                className="button"
                onClick={() => setPlayerId(1)}
                type="button"
            >
              Join Room
            </button>)}
        </form>
      </div>
  );
}
