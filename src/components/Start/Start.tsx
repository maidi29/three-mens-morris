import React, {useEffect, useState} from "react";
import styles from './Start.module.scss';
import socketService from "../../services/socketService";
import roomService from "../../services/roomService";
import Picker, {IEmojiData} from 'emoji-picker-react';
import {Stone} from "../Stone/Stone";
import {getRandomColor, getRandomEmoji} from "../../utils/helper";
import {PHASE, PLAYER, Player, useStore} from "../../store/store";

export function Start({ }): JSX.Element {
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
    const id = queryParams.get("id")

  useEffect(()=>{
      if (id) setRoomName(id);
  },[id]);


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
    if(!socket) return;

    if (playerId ===  PLAYER.ONE && !roomName) return;
    let roomInfo;
    let roomId;

    const ownPlayer: Player = {
      symbol: chosenEmoji,
      id: playerId,
      color,
      score: 0,
      activated: true,
    };

    setIsCreating(true);
    if (playerId === PLAYER.ONE) {
      roomInfo = await roomService
          .joinGameRoom(socket, { player: ownPlayer, roomId: roomName })
          .catch((err) => {
              console.log(err);
          });
      if (roomInfo) {
        setRoom({ roomId: roomName });
        setOpponent(roomInfo.opponent);
        setPhase(PHASE.SET);
      }
    } else {
      roomId = await roomService
          .createGameRoom(socket, ownPlayer)
          .catch((err) => console.log(err));
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
            <Stone emoji={chosenEmoji} color={color} size={7.5}/>
            <div>
                <h3>Style your token</h3>
                <div className={styles.buttonRow}>
                    <input className={styles.styleButton} type="color" onChange={e => setColor(e.target.value)} value={color} title="Change color"/>
                    <button className={styles.styleButton} onClick={()=>togglePicker()} title="Change symbol">{chosenEmoji}</button>
                    <button className={styles.styleButton} onClick={()=>{
                        setColor(getRandomColor());
                        setChosenEmoji(getRandomEmoji())
                    }} title="Randomize color and symbol">🔀</button>
                    { pickerOpen && <Picker onEmojiClick={onEmojiClick}
                                            pickerStyle={{
                                                boxShadow: 'none',
                                                borderRadius: '0px',
                                                position: 'absolute',
                                                top: '0',
                                                marginTop: '3rem'
                    }} disableSearchBar native /> }

                </div>
            </div>
        </div>
      <div className={styles.start}>
          <div>
            <button className="button" type="submit" disabled={isCreating} onClick={() => start(PLAYER.ZERO)}>
                  Host Game{isCreating ? "..." : ""}
            </button>
        </div>
            <div className={styles.joinSection}>
                 <input
                  className="input"
                  maxLength={3}
                  placeholder="Game ID"
                  value={roomName}
                  onChange={handleRoomNameChange}/>
                <button
                    className="button"
                    onClick={() => start(PLAYER.ONE)}
                    type="submit"
                    disabled={isCreating}
                >
                  Join Game{isCreating ? "..." : ""}
                </button>
            </div>
      </div>
      </div>
  );
}
