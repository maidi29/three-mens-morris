# Buzz'n'Click

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

### Static webspace and separate cloud server
### Frontend
Run
#### `yarn build-client` (or `npm build-client`)
in the root project directory.
Take the generated content of the 'build' folder and upload it to the webspace (e.g. with FileZilla) 

### Backend
Connect to the server e.g. with WinSCP and copy all files from socketio-server to the server (except node_modules)
Connect to the server with PuTTY and run 
#### `yarn install`
and then
#### `pm2 start npm --name "socketio-server" -- -start`



## Start locally
Change the BASE_API_URL varaibale in src/utils/constants.ts to 'http://localhost:3000'.

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
