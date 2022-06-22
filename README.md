# Three Men's Morris

Todo:
- how to play
- Impressum
- code refactoren
- coole animations?
- toasts on error (room creation)
- info bei Klick auf disabled button (status box emphasizen)
- status box stylen
- Domain umstellen und in backend eintragen
- meta info
- fallback für share button


## Setup

In the root project directory, run:

#### `yarn`

to install all dependencies of server and client.

(If you want to use npm you gave to run `npm install` in the root project directory and in the ***socketio-server*** directory)

## Start in production

### One Server (e.g. heroku)
Run
#### `yarn build` (or `npm build`)
in the root project directory.
Run
#### `yarn start` (or `npm start`)
in the root project directory.


## Start locally
Change the BASE_API_URL variable in src/utils/constants.ts to 'http://localhost:3000'.

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
