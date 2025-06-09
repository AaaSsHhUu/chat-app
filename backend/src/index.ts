// Entry point : Initializes and exports the Websocket server
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import app from "./app";
import {AuthenticatedSocket, authenticatedUsers, handleMessage, roomMembers} from "./websocket/handlers";

const server = http.createServer(app);

// Attach WebSocket server
const wss = new WebSocketServer({server})

wss.on("connection", (socket : WebSocket) => {
    let isAuthenticated = false;
    let authSocket = socket as AuthenticatedSocket;

    socket.on("message", async (data) => {
        try {
            const msg = JSON.parse(data.toString());
            if(!isAuthenticated){
                if(msg.type === "auth"){
                    await handleMessage(socket, msg);
                    if(authSocket.userId) isAuthenticated = true;
                }
                else{
                    socket.send(JSON.stringify({
                        type : "error",
                        message : "Authentication required"
                    }))
                    socket.close();
                }
                return ;
            }
            await handleMessage(authSocket, msg);
        } catch (error) {
            socket.send(JSON.stringify({type : "error", message : "Invalid message format"}))
        }
    })

    // Cleanup function
    socket.on("close", () => {
        // Remove user from roomMembers (in memory) when disconnects
        for(const [roomId, members] of Object.entries(roomMembers)){
            members.delete(authSocket.userId!);
            if(members.size === 0){
                delete roomMembers[roomId];
            }
        }
        // Remove user from authenticatedUsers (in memory) when disconnects
        authenticatedUsers.delete(authSocket.userId!);
    })
})

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})

/*
Common steps for a Realtime Chat app - 
    1. Start a websocket server
    2. Track connected clients
    3. Authenticate the websocket
    4. Handle message type (join, chat, create-room, leave etc.)
    5. Room managment (optional)
    6. Broadcasting messages
    7. Disconnect cleanup
    8. Optional events like - isTyping indicators, read receipts, online/offline etc.


Things to keep in mind - 
    > Authentication - Prevents unauthenticated users from sending and receiving messages.
    > Scalability - Storing socket state in memory is fine for small apps, for large use Redus/pub-sub
    > Security - Validate everything, Rate-limiting messages, check room membership before sending
    > Persistence - Always save chat messages to the DB so users can reload later.
    > Room Isolation - Make sure users only get messages from the room they have joined.
*/