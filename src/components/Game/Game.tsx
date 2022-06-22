import React, {useEffect, useState} from "react";
import gameService, {Turn} from "../../services/gameService";
import socketService from "../../services/socketService";
import {PHASE, PLAYER, useStore} from "../../store/store";
import styles from './Game.module.scss';
import {Stone} from "../Stone/Stone";
import classnames from "classnames";
import {coordinateExistsInSet, getAdjacentFields} from "../../utils/boardLogic";
import {Board} from "../Board/Board";
import roomService from "../../services/roomService";
import Lottie from 'react-lottie';
import pop from '../../lotties/pop.json';

export type Coordinate = {x: number, y: number};

export function Game(): JSX.Element {
  const {
    setGameFinished, activePlayer, setActivePlayer, room, winner, opponent, me, setOpponent, phase, nonPlayedStones,
    playStone, playedStones, resetActiveGameButKeepRoom, gameFinished, increaseScore, matrix, updateMatrix, winningFields,
    adjacentFields, setAdjacentFields, setWinningFields, setActivated
  } = useStore();
  const [listenersAttached, setListenersAttached] = useState(false);
  const [prevCoordinate, setPrevCoordinate] = useState<Coordinate | undefined>();

  const turnFinished = (coord: Coordinate) => {
    if (socketService.socket) {
      setPrevCoordinate(undefined);
      gameService.turnFinished(socketService.socket, {newCoordinate: coord, playerId: activePlayer || 0, ...(phase === PHASE.MOVE && {prevCoordinate})})
    }
  };

  const handleTurnFinished = () => {
    if (socketService.socket) {
      gameService.onTurnFinished(socketService.socket, (turn: Turn) => {
        updateMatrix(turn.newCoordinate, turn.playerId, turn.prevCoordinate);
        setActivePlayer(turn.playerId === PLAYER.ZERO ? PLAYER.ONE : PLAYER.ZERO);
        playStone(turn.playerId, turn.newCoordinate, turn.prevCoordinate);
      });
    }
  };

  const reactivate = () => {
    setActivated(true, false, true);
    resetActiveGameButKeepRoom();
    if (socketService.socket) {
      gameService.reactivate(socketService.socket);
    }
  };

  const handleReactivate = () => {
    if (socketService.socket) {
      gameService.onReactivate(socketService.socket, () => {
        console.log('opponent reactivate');
        setActivated(false, true, true);
      });
    }
  };

  const handleOpponentLeft = () => {
    if (socketService.socket) {
      roomService.onOpponentLeft(socketService.socket, () =>
        setOpponent(undefined)
      );
    }
  };

  const handleOpponentJoin = () => {
    if (socketService.socket) {
      roomService.onOpponentJoined(socketService.socket, (player) => {
        setOpponent(player);
      });
    }
  };

  useEffect(() => {
    if (winner !== null) {
      setActivePlayer(null);
      setGameFinished(true);
      setActivated(true,true,false);
      increaseScore(winner);
    }
  }, [winner]);

  useEffect(() => {
    if (!gameFinished) {
      setWinningFields(new Set<Coordinate>());
    }
  }, [gameFinished]);

  useEffect(() => {
    if (!listenersAttached) {
      handleOpponentJoin();
      handleOpponentLeft();
      handleTurnFinished();
      handleReactivate();
      setListenersAttached(true);
    }
  }, []);

  const isFieldEnabled = (value: PLAYER | null, coord: Coordinate): boolean => {
    if (activePlayer === me?.id && winner === null && opponent?.activated) {
      if (phase === PHASE.SET) {
        return value === null;
      } else if (phase === PHASE.MOVE) {
        if (prevCoordinate) {
          return coordinateExistsInSet(coord, adjacentFields) && value === null;
        } else {
          const emptyAdjacentFields = Array.from(getAdjacentFields(coord)).filter(({x, y}) => matrix[x][y] === null);
          return value === me?.id && emptyAdjacentFields.length > 0;
        }
      }
      return false;
    }
    return false;
  }

  return (
      <>
        { me?.id === PLAYER.ZERO &&
            <div className={styles.shareInfo}>
              <h2>Game ID: {room?.roomId}</h2>
              { !opponent &&
                  <button className={styles.shareButton} onClick={()=> {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Invite',
                        url: `${window.location}?id=${room?.roomId}`
                      }).then(() => {
                        console.log('Thanks for sharing!');
                      })
                          .catch(console.error);
                    } else {
                      //shareDialog.classList.add('is-open');
                    }
                  }}>
                    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M22 6a4 4 0 10-7.912.838L9.017 9.373a4 4 0 10-.329 5.589l5.33 2.665a4 4 0 10.686-1.893l-4.912-2.456a3.996 3.996 0 00.12-2.116l5.071-2.535A4 4 0 0022 6z" fill="currentColor"/>
                  </svg>
                  </button> }
            </div>}
      <div className={styles.game}>

        <div className={styles.status}>

        { !opponent || (!gameFinished && !opponent.activated) ?
            <h2 className={styles.pulse}>Wait for opponent to join</h2> :
            winner !== null ?
                <>
                  { winner === me?.id ?
                      <div className={styles.winningText}>
                        <h2 className={styles.pulse}>Victory</h2>
                        <Lottie
                            options={{
                              loop: true,
                              autoplay: true,
                              animationData: pop,
                              rendererSettings: {
                                preserveAspectRatio: "xMidYMid slice",
                              }}}
                            height={90}
                            width={150}
                        />
                      </div> : <h2>Defeat ☹</h2> }
                      <button className={classnames('button', styles.playAgain)} onClick={reactivate}>
                        Play again
                      </button>
                </> :
                (activePlayer === me?.id ? <h2 className={styles.pulse}>your turn {winner}</h2> : <h2>opponents turn {winner}</h2>)
        }
        </div>

        <div className={styles.board}>
          <Board/>
          <div className={styles.fields}>
            <>
              {playedStones.map(({element, position}) =>
                  <div className={classnames(styles.stone, styles[`s${position}`])}>{element}</div>)}
              {matrix.map((row, x) => (
                <div className={styles.row}>
                  {row.map((value, y)=> (
                      <button
                          className={classnames(
                              styles.field,
                              coordinateExistsInSet( {x,y}, winningFields) && styles.winningField,
                              isFieldEnabled(value, {x,y}) && styles.activeField
                          )}
                          onClick={() =>{
                            if (activePlayer === me?.id && opponent) {
                              if (phase === PHASE.MOVE && !prevCoordinate) {
                                setAdjacentFields(getAdjacentFields({x,y}));
                                setPrevCoordinate({x,y});
                              } else {
                                turnFinished({x,y})
                              }
                            }
                          }}
                          disabled={!isFieldEnabled(value, {x,y})}/>
                  ))}
                </div>
            ))}
            </>
          </div>
      </div>


        <div className={styles.playerInfo}>
          <div className={styles.playerBox}>
            <div className={styles.head}>
            <h3>{me?.symbol} Me</h3>
            <div className={styles.score}>
              <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 1280.000000 972.000000"
                   preserveAspectRatio="xMidYMid meet">
                <g transform="translate(0.000000,972.000000) scale(0.100000,-0.100000)"
                   fill="#000000" stroke="none">
                  <path d="M3120 9617 c-595 -270 -881 -532 -991 -908 -17 -60 -22 -109 -26
-261 -5 -177 -4 -189 16 -221 11 -18 32 -39 46 -45 94 -43 335 26 500 143 76
54 198 181 253 265 52 79 130 238 167 340 49 139 97 340 100 424 2 45 13 128
24 186 24 119 24 120 14 120 -5 0 -51 -20 -103 -43z"/>
                  <path d="M9576 9643 c19 -74 49 -281 41 -276 -25 15 26 -216 89 -406 72 -214
168 -383 294 -515 153 -161 343 -260 522 -273 144 -11 174 22 184 198 31 536
-282 918 -1017 1244 -56 25 -105 45 -109 45 -5 0 -6 -8 -4 -17z"/>
                  <path d="M1572 9268 c-160 -299 -251 -542 -288 -768 -22 -132 -13 -440 16
-557 37 -156 120 -313 205 -392 37 -34 51 -41 86 -41 84 0 182 96 260 255 54
110 103 282 95 330 -5 23 -4 27 5 15 8 -12 10 -10 5 10 -2 14 -1 68 3 120 15
172 -11 356 -80 560 -41 124 -131 328 -201 458 l-55 104 -51 -94z"/>
                  <path d="M11127 9259 c-134 -251 -231 -511 -268 -715 -30 -168 -23 -431 15
-579 47 -183 161 -373 260 -434 20 -12 50 -21 75 -21 69 0 138 75 221 239 46
91 94 261 86 304 -4 19 -2 26 6 21 7 -5 8 -3 4 5 -5 7 -2 57 4 111 35 275 -63
641 -284 1054 l-63 118 -56 -103z"/>
                  <path d="M2845 8326 c-214 -72 -300 -107 -423 -171 -344 -182 -554 -413 -632
-695 -24 -90 -47 -298 -35 -326 10 -24 12 -30 14 -49 2 -32 55 -75 101 -83 51
-9 214 3 248 18 12 5 22 8 22 6 0 -2 -51 -42 -112 -89 -350 -265 -538 -508
-614 -792 -14 -54 -19 -106 -19 -225 0 -85 4 -168 8 -185 5 -22 5 -26 -3 -15
-7 11 -8 -2 -4 -45 22 -205 131 -227 394 -78 98 55 183 124 243 198 54 67 142
233 180 340 35 98 80 303 72 333 -4 17 -2 22 6 16 9 -5 10 0 6 18 -4 13 0 74
8 134 8 60 17 181 20 269 7 178 12 226 24 222 17 -4 141 96 214 173 122 129
213 280 307 510 71 174 111 324 81 305 -10 -5 26 136 54 215 17 49 17 50 8 50
-5 0 -80 -24 -168 -54z"/>
                  <path d="M9790 8375 c0 -6 34 -126 67 -239 4 -13 2 -16 -7 -11 -10 6 -12 -4
-8 -46 12 -115 161 -460 267 -620 28 -42 83 -111 123 -154 76 -82 228 -204
228 -184 0 7 2 10 5 7 6 -5 29 -439 28 -518 -1 -38 2 -49 7 -35 6 13 7 3 3
-25 -6 -55 36 -268 78 -394 39 -117 127 -287 186 -361 60 -74 145 -143 243
-198 160 -90 256 -115 319 -82 43 22 75 92 68 148 -3 23 -2 35 2 28 5 -7 8 8
9 36 0 26 1 109 2 183 3 174 -27 306 -102 453 -86 170 -291 393 -520 566 -126
95 -173 134 -115 97 27 -18 197 -34 257 -24 46 8 99 51 101 83 3 28 4 33 12
41 12 12 8 146 -8 235 -38 221 -127 383 -301 549 -181 173 -495 337 -843 440
-40 12 -80 24 -87 27 -8 3 -14 2 -14 -2z"/>
                  <path d="M897 7985 c-61 -204 -79 -269 -101 -370 -45 -210 -59 -352 -51 -520
4 -82 7 -161 7 -175 1 -109 46 -286 100 -395 58 -115 163 -245 247 -306 61
-44 109 -51 162 -24 36 19 86 96 122 186 59 148 72 241 71 499 0 126 -4 170
-22 237 -60 223 -182 446 -395 718 -142 181 -133 172 -140 150z"/>
                  <path d="M11840 7928 c-144 -186 -177 -230 -238 -323 -187 -286 -268 -533
-260 -801 1 -67 7 -120 11 -117 4 3 5 -7 1 -21 -15 -61 50 -284 113 -389 42
-69 82 -97 140 -97 56 0 141 65 228 172 75 95 123 182 160 291 50 149 60 250
59 547 -1 176 -5 224 -27 339 -26 134 -117 471 -127 470 -3 0 -30 -32 -60 -71z"/>
                  <path d="M376 6383 c5 -76 9 -168 9 -205 0 -36 2 -63 5 -58 3 4 6 -22 7 -58 2
-90 46 -311 89 -441 106 -326 290 -550 556 -676 185 -88 271 -41 286 158 4 45
7 159 6 252 0 165 -1 173 -33 265 -91 266 -281 486 -613 708 -86 58 -306 192
-314 192 -4 0 -2 -62 2 -137z"/>
                  <path d="M12316 6455 c-526 -317 -781 -605 -842 -955 -16 -95 -15 -319 2 -365
5 -12 4 -16 -3 -12 -16 10 13 -127 34 -163 43 -74 126 -76 268 -6 226 112 391
295 497 554 65 159 133 445 122 511 -3 20 -2 31 3 24 5 -6 8 8 8 35 1 26 6
110 13 187 7 77 14 166 17 198 3 31 1 57 -3 57 -4 0 -56 -29 -116 -65z"/>
                  <path d="M2159 5863 c-398 -419 -576 -784 -554 -1138 3 -60 8 -146 10 -190 7
-137 58 -285 112 -320 69 -46 148 -22 276 82 121 100 208 213 264 346 41 98
74 223 78 302 2 33 9 114 15 180 12 121 8 290 -11 435 -15 119 -72 410 -80
410 -4 0 -53 -48 -110 -107z"/>
                  <path d="M10522 5925 c-64 -279 -84 -463 -80 -722 2 -116 5 -210 8 -208 3 2 6
-22 6 -53 2 -70 42 -224 83 -314 76 -169 233 -339 381 -414 90 -45 160 -21
204 69 54 111 71 235 70 512 0 131 -4 162 -27 247 -70 255 -240 525 -506 800
l-128 132 -11 -49z"/>
                  <path d="M200 5103 c0 -2 18 -40 41 -84 47 -95 62 -132 50 -125 -15 10 -18
-39 -6 -87 31 -121 265 -468 412 -608 124 -119 281 -222 383 -251 36 -10 49
-16 30 -13 -19 3 -78 12 -130 20 -117 17 -353 35 -477 35 l-93 0 53 -82 c72
-112 72 -112 59 -104 -18 11 -26 -41 -13 -84 25 -84 261 -376 404 -502 95 -83
222 -168 304 -205 98 -43 194 -73 242 -74 l46 -1 -45 -8 c-25 -5 -124 -21
-220 -36 -96 -15 -177 -29 -180 -31 -2 -2 0 -7 5 -11 27 -19 138 -144 123
-139 -18 6 -28 -10 -28 -47 0 -38 53 -108 141 -187 349 -313 631 -450 939
-453 63 0 131 2 150 7 19 4 -35 -17 -120 -46 -236 -82 -310 -110 -310 -117 0
-3 29 -28 65 -54 55 -40 102 -84 67 -62 -13 8 -32 -24 -32 -54 0 -99 486 -361
790 -426 125 -27 327 -25 444 4 113 28 261 98 309 145 39 40 56 92 38 124 -8
17 -4 24 29 49 22 16 40 32 40 36 0 4 -26 40 -58 80 -162 203 -368 328 -608
369 -89 15 -368 6 -474 -15 -131 -26 -147 -26 -59 -3 51 13 102 34 122 50 38
29 61 84 51 123 -5 18 1 26 25 39 17 8 31 19 31 23 0 4 -16 38 -35 75 -163
317 -424 501 -781 548 -113 15 -127 19 -91 30 51 14 84 58 89 118 1 20 9 33
20 37 23 7 23 6 -12 114 -108 329 -305 534 -640 662 -41 15 -59 25 -40 21 19
-5 82 -8 140 -8 81 0 113 4 142 18 39 20 73 76 65 107 -3 12 2 20 14 23 23 6
23 21 4 124 -61 320 -249 568 -544 718 -157 79 -394 147 -666 190 -88 13 -170
26 -182 29 -13 2 -23 2 -23 -1z"/>
                  <path d="M12550 5099 c-232 -36 -334 -55 -445 -84 -484 -122 -761 -346 -880
-712 -26 -79 -57 -242 -48 -255 2 -5 14 -8 26 -9 12 0 16 -3 10 -6 -17 -6 -16
-38 2 -72 25 -49 75 -66 200 -66 61 0 124 4 140 8 17 5 -13 -9 -66 -31 -136
-55 -250 -126 -341 -211 -128 -120 -217 -263 -272 -439 -32 -101 -32 -110 -3
-122 12 -5 17 -9 11 -9 -8 -1 -9 -12 -5 -34 15 -66 41 -95 94 -107 31 -7 31
-7 7 -12 -14 -3 -72 -13 -130 -22 -322 -51 -553 -206 -714 -479 -25 -42 -52
-92 -60 -111 -14 -33 -14 -33 23 -54 20 -12 31 -22 26 -22 -15 0 -17 -39 -4
-78 14 -42 76 -88 130 -97 22 -4 39 -9 36 -11 -2 -2 -55 3 -118 12 -154 22
-395 15 -494 -13 -216 -62 -391 -184 -545 -380 l-41 -52 40 -32 c34 -27 39
-35 30 -51 -17 -33 -1 -85 38 -125 48 -47 196 -117 309 -145 117 -29 319 -31
444 -4 300 64 790 328 790 425 0 29 -18 63 -31 56 -5 -4 -9 -4 -9 -2 0 3 34
29 75 59 41 29 75 56 75 59 0 3 -21 13 -47 22 -349 120 -422 146 -388 140 59
-12 241 -8 310 6 208 43 437 158 636 322 241 199 314 293 265 342 -13 12 -6
24 51 86 36 40 64 73 62 75 -4 2 -107 20 -359 60 -70 12 -77 14 -39 15 48 1
144 31 241 74 139 62 318 202 451 352 104 117 225 279 249 333 21 47 21 99 0
94 -16 -3 -10 9 58 116 l50 77 -72 3 c-91 4 -362 -14 -488 -33 -179 -26 -179
-26 -116 -9 93 26 244 120 365 230 193 174 467 605 443 696 -2 10 -8 15 -13
12 -12 -7 3 30 51 126 23 45 40 85 38 89 -2 4 -23 4 -48 0z m-933 -1185 c-3
-3 -12 -4 -19 -1 -8 3 -5 6 6 6 11 1 17 -2 13 -5z m-1290 -1860 c-3 -3 -12 -4
-19 -1 -8 3 -5 6 6 6 11 1 17 -2 13 -5z m40 -10 c-3 -3 -12 -4 -19 -1 -8 3 -5
6 6 6 11 1 17 -2 13 -5z"/>
                  <path d="M10242 4632 c-46 -140 -92 -319 -118 -457 -18 -94 -28 -519 -12 -509
4 3 5 -8 2 -25 -8 -40 21 -179 58 -274 75 -195 297 -437 400 -437 57 0 124 70
177 185 53 112 67 224 65 510 -1 120 -5 166 -23 233 -66 252 -206 515 -423
795 -39 51 -74 95 -77 99 -4 4 -26 -50 -49 -120z"/>
                  <path d="M2407 4612 c-305 -408 -443 -757 -422 -1067 3 -55 8 -140 10 -190 5
-113 30 -204 83 -293 44 -74 88 -118 128 -128 102 -26 339 218 422 433 34 87
67 235 58 258 -3 9 -1 39 5 68 5 28 10 117 10 197 1 155 -15 284 -57 455 -33
137 -117 405 -126 405 -5 0 -55 -62 -111 -138z"/>
                  <path d="M2970 3839 c-189 -385 -254 -632 -248 -941 2 -86 6 -151 10 -145 5 7
5 -2 2 -19 -19 -98 77 -354 181 -487 76 -96 141 -120 210 -77 70 43 195 240
239 375 20 63 46 197 40 207 -3 4 0 54 6 111 26 257 -51 553 -240 922 -42 83
-87 165 -98 184 l-21 35 -81 -165z"/>
                  <path d="M9711 3929 c-124 -219 -230 -466 -276 -642 -39 -151 -47 -234 -41
-426 7 -237 39 -357 136 -517 136 -225 233 -251 355 -97 94 121 171 313 181
453 2 36 8 111 13 167 26 288 -56 600 -266 1017 l-60 120 -42 -75z"/>
                  <path d="M3645 3278 c-2 -7 -14 -78 -27 -158 -19 -123 -22 -188 -23 -430 -2
-309 7 -401 50 -555 66 -232 204 -430 388 -552 120 -80 189 -70 245 34 36 69
74 205 78 283 1 30 5 109 9 175 9 135 -1 213 -41 339 -66 208 -198 406 -429
645 -147 152 -244 237 -250 219z"/>
                  <path d="M8994 3143 c-289 -284 -435 -492 -514 -732 -32 -100 -55 -261 -45
-330 3 -25 8 -91 10 -146 7 -168 66 -347 129 -387 77 -48 196 11 347 170 94
98 156 199 205 331 37 99 67 234 59 262 -4 11 -2 19 5 19 8 0 10 8 7 21 -3 11
1 77 10 147 10 89 13 172 9 277 -7 191 -48 515 -65 515 -3 0 -74 -66 -157
-147z"/>
                  <path d="M4501 2358 c52 -129 69 -179 59 -173 -6 4 -10 -12 -10 -42 0 -78 115
-313 252 -514 215 -317 529 -509 832 -509 124 0 166 27 180 112 1 11 8 23 15
27 10 7 11 27 2 98 -66 545 -401 836 -1164 1012 -97 23 -179 41 -182 41 -3 0
5 -24 16 -52z"/>
                  <path d="M8159 2375 c-609 -138 -940 -344 -1096 -683 -59 -127 -110 -377 -88
-429 5 -10 10 -29 12 -42 13 -75 59 -101 179 -101 316 0 625 196 854 543 110
165 222 395 228 465 3 40 2 53 -7 48 -11 -7 -3 15 53 153 28 68 31 81 19 80
-5 0 -74 -16 -154 -34z"/>
                  <path d="M4032 1479 c-193 -25 -435 -124 -667 -274 -108 -69 -314 -218 -315
-226 0 -4 28 -16 63 -29 66 -24 92 -40 65 -40 -10 0 -19 -12 -23 -30 -14 -65
45 -105 226 -154 572 -155 982 -93 1270 194 75 74 101 131 81 174 -9 21 -6 31
29 77 21 29 39 55 39 58 0 3 -25 24 -55 46 -229 167 -469 236 -713 204z"/>
                  <path d="M8513 1476 c-155 -30 -317 -101 -446 -196 l-67 -50 40 -54 c37 -49
40 -56 29 -80 -21 -46 4 -101 80 -176 288 -287 698 -349 1270 -194 180 49 240
89 226 153 -3 16 -14 31 -23 33 -9 2 18 18 61 35 l79 30 -126 92 c-304 223
-550 347 -780 395 -113 23 -257 28 -343 12z"/>
                  <path d="M6324 1249 c-48 -14 -120 -83 -139 -134 -13 -34 -16 -60 -11 -112 4
-37 6 -84 6 -103 -2 -95 62 -193 145 -220 138 -46 285 52 292 195 1 28 8 71
14 97 10 37 10 60 0 101 -31 139 -167 217 -307 176z"/>
                  <path d="M5255 1054 c-276 -46 -587 -227 -935 -541 l-54 -50 74 -23 c41 -13
67 -25 58 -27 -23 -6 -34 -48 -20 -78 16 -35 75 -61 188 -84 568 -115 968 -37
1250 243 69 69 110 130 114 171 5 42 0 66 -12 59 -12 -8 -12 -7 39 73 18 29
33 56 33 62 0 15 -49 46 -147 95 -207 104 -386 135 -588 100z"/>
                  <path d="M7249 1054 c-42 -7 -109 -25 -150 -40 -76 -27 -226 -101 -267 -133
l-24 -18 41 -66 c22 -37 36 -67 31 -67 -18 0 -11 -80 11 -121 11 -22 53 -73
92 -113 279 -282 682 -361 1251 -245 113 23 172 49 188 84 14 30 3 72 -20 77
-9 3 18 15 61 29 l78 24 -93 81 c-362 313 -622 460 -902 509 -106 18 -194 18
-297 -1z"/>
                </g>
              </svg>
              {me?.score}
            </div>
            </div>
            <div className={styles.nonPlayedStones}>
            { me && nonPlayedStones[me?.id].map(()=>(
                <Stone emoji={me.symbol} color={me?.color} size={4}/>
            ))}
            </div>
          </div>
          {opponent &&
          <div className={styles.playerBox}>
               <div className={styles.head}>
                 <h3>{opponent?.symbol} Opponent</h3>
                 <div className={styles.score}>
                   {opponent?.score}
                 </div>
               </div>
               <div className={styles.nonPlayedStones}>
                  {nonPlayedStones[opponent.id].map(()=>(
                     <Stone color={opponent?.color} emoji={opponent?.symbol} size={4}/>
                 ))}
               </div>
          </div>}
        </div>

      </div>
      </>
  );
}
