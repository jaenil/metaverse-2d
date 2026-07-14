import './dotenv-setup.js';
import { WebSocketServer } from 'ws';
import { User } from './User.js';

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', function connection(ws) {
  const user = new User(ws) ;
  ws.on('error',console.error) ;
  //TODO:The User instance represents the connection itself. It should be created exactly once, immediately when the connection opens — not inside a message listener.
  //Every time a message arrives, parse it and route it to the user’s existing methods — don’t create a new user.
  ws.on('message', function message(data) {
    user.handleMessage(data) 
  })
  ws.on("close",()=>{
    if(user.spaceId) user.destroy()
  })
});