# Three Men's Morris

Three men's morris is an abstract strategy game played on a three by three board (counting lines) that is similar to tic-tac-toe.
The winner is the first player to align their three tokens on a line drawn on the board.
The game consists of two phases

 1. Phase: Placing Tokens
 The board is empty to begin the game, and players take turns placing their tokens on empty intersections. Each player has three tokens.


 2. Phase: Moving Tokens
 Once all pieces are placed (assuming there is no winner by then), play proceeds with each player moving one of their tokens per turn.
 A token may move to any adjacent linked empty position.

Todo:
- how to play
- code refactoren
- coole animations?
- info bei Klick auf disabled button (status box emphasizen)
- status box stylen
- safari testen

## Setup

In the root project directory, run:

#### `yarn`

to install all dependencies of server and client.

(If you want to use npm you have to run `npm install` in the root project directory and in the ***socketio-server*** directory)

## Start in production

### One Server (e.g. heroku)
Run
#### `yarn build` (or `npm build`)
in the root project directory.
Run
#### `yarn start` (or `npm start`)
in the root project directory.


## Start locally
Change the BASE_API_URL variable in src/utils/constants.ts to 'http://localhost:3006'.

### Client
Run 
#### `yarn run start-client` (or `npm run start-client`)
in the root directory of the project to start the react app and open in under [http://localhost:3006](http://localhost:3006) to 
view it in the browser.
The page will reload if you make edits.\
You will also see any lint errors in the console.

### Server
Run 
#### `yarn run dev` (or `npm run dev`)
in the ***socketio-server*** directory to start the backend under [http://localhost:3000](http://localhost:3000)
