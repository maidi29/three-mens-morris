import React, { useEffect, useState } from "react";
import styles from "./Start.module.scss";
import socketService from "../../../services/socketService";
import roomService from "../../../services/roomService";
import Picker, { IEmojiData } from "emoji-picker-react";
import { getRandomColor, getRandomEmoji } from "../../../utils/helper";
import { PHASE, PLAYER, Player, useStore } from "../../../store/store";
import toast from "react-hot-toast";
import { Token } from "../../elements/Token/Token";
import { Button } from "../../elements/Button/Button";
import { Input } from "../../elements/Input/Input";

export const Start = (): JSX.Element => {
  const setRoom = useStore((state) => state.setRoom);
  const setOpponent = useStore((state) => state.setOpponent);
  const setMe = useStore((state) => state.setMe);
  const setPhase = useStore((state) => state.setPhase);
  const [color, setColor] = useState<string>(getRandomColor());
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [chosenEmoji, setChosenEmoji] = useState<string>(getRandomEmoji());
  const queryParams = new URLSearchParams(window.location.search);
  const id = queryParams.get("id");

  useEffect(() => {
    if (id) setRoomName(id);
    return () => {
      setRoomName("");
    };
  }, [id]);

  const onEmojiClick = (event: React.MouseEvent, emoji: IEmojiData) => {
    setChosenEmoji(emoji.emoji);
    setPickerOpen(false);
  };

  const togglePicker = () => {
    setPickerOpen(!pickerOpen);
  };

  const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
    const value = e.target.value;
    setRoomName(value);
  };

  const start = async (playerId: PLAYER) => {
    const socket = socketService.socket;
    if (!socket) {
      toast("Error with connection, please reload!", {
        icon: "❗",
        duration: 3000,
      });
      return;
    }
    if (playerId === PLAYER.ONE && !roomName) {
      toast("Please enter a Game ID.", { icon: "❗", duration: 3000 });
      return;
    }

    const ownPlayer: Player = {
      symbol: chosenEmoji,
      id: playerId,
      color,
      score: 0,
      activated: true,
      socketId: socket.id,
    };

    setIsCreating(true);

    if (playerId === PLAYER.ONE) {
      const roomInfo = await roomService
        .joinGameRoom(socket, { player: ownPlayer, roomId: roomName })
        .catch((err) => {
          toast(err, { icon: "❗", duration: 3000 });
        });
      if (roomInfo) {
        setRoom({ roomId: roomName });
        setOpponent(roomInfo.opponent);
        setPhase(PHASE.SET);
      }
    } else {
      const roomId = await roomService
        .createGameRoom(socket, ownPlayer)
        .catch((err) => {
          toast(err, { icon: "❗", duration: 3000 });
        });
      if (roomId) {
        setRoom({ roomId });
      }
    }
    setMe(ownPlayer);
    setIsCreating(false);
  };

  return (
    <div className={styles.centerColumn}>
      <div className={styles.centerColumn}>
        <Token emoji={chosenEmoji} color={color} size={7.5} />
        <div>
          <h3>Style your token</h3>
          <div className={styles.buttonRow}>
            <input
              className={styles.styleButton}
              type="color"
              onChange={(e) => setColor(e.target.value)}
              value={color}
              title="Change color"
            />
            <button
              className={styles.styleButton}
              onClick={() => togglePicker()}
              title="Change symbol"
            >
              {chosenEmoji}
            </button>
            <button
              className={styles.styleButton}
              onClick={() => {
                setColor(getRandomColor());
                setChosenEmoji(getRandomEmoji());
              }}
              title="Randomize color and symbol"
            >
              🔀
            </button>
            {pickerOpen && (
              <Picker
                onEmojiClick={onEmojiClick}
                pickerStyle={{
                  boxShadow: "none",
                  borderRadius: "0px",
                  position: "absolute",
                  top: "0",
                  marginTop: "3rem",
                }}
                disableSearchBar={true}
                native={true}
              />
            )}
          </div>
        </div>
      </div>
      <div className={styles.start}>
        <div>
          <Button
            type="submit"
            disabled={isCreating}
            onClick={() => start(PLAYER.ZERO)}
          >
            Host Game{isCreating ? "..." : ""}
          </Button>
        </div>
        <div className={styles.joinSection}>
          <Input
            maxLength={3}
            placeholder="Game ID"
            value={roomName}
            onChange={handleRoomNameChange}
          />
          <Button
            onClick={() => start(PLAYER.ONE)}
            type="submit"
            disabled={isCreating}
          >
            Join Game{isCreating ? "..." : ""}
          </Button>
        </div>
      </div>
    </div>
  );
};
