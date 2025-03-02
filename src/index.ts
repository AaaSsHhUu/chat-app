import {connection, server as WebSockerServer} from "websocket";
import http from "http";
import { IncomingMessage, InitMessageType, SupportedMessage, UpvoteMessageType, UserMessageType } from "./messages/incomingMessages";
import {OutgoingMessage, SupportedMessage as OutgoingSupportedMessages} from "./messages/outgoingMessages";
import { UserManager } from "./UserManager";
import { InMemoryStore } from "./store/InMemoryStore";

const server = http.createServer((request : any, response : any) => {
    console.log((new Date()) + " Recieved Request from " + request.url);
    response.writeHead(404);
    response.end();
});

const userManager = new UserManager();
const store = new InMemoryStore();

server.listen(8080, function (){
    console.log(new Date() + `Server is listening on port 8080`);
});

const wss = new WebSockerServer({
    httpServer : server,
    autoAcceptConnections : false
})

function originIsAllowed(origin : string){
    return true;
}

wss.on('request', function(request){
    if(!originIsAllowed(request.origin)){
        request.reject();
        console.log((new Date()) + ` Connection from ${request.origin} rejected`);
        return;
    }

    let connection = request.accept('echo-protocol', request.origin);
    console.log(new Date() + " Connection accepted");
    connection.on('message', function (message){
        if(message.type === 'utf8'){
            try {
                messageHandler(connection, JSON.parse(message.utf8Data))
            } catch (error) {
                
            }
        }
        else if (message.type === 'binary'){
            console.log(`Received binary message of ${message.binaryData.length} bytes`);
        }
    });
    connection.on("close", function(reasonCode, description){
        console.log(new Date() + ` Peer ${connection.remoteAddress} disconnected`);
    })
})

function messageHandler(ws : connection,message : IncomingMessage){
    if(message.type === SupportedMessage.JoinRoom){
        const payload = message.payload;
        userManager.addUser(payload.name, payload.roomId, payload.userId, ws)
    }

    if(message.type === SupportedMessage.SendMessage){
        const payload = message.payload;
        const user = userManager.getUser(payload.roomId, payload.userId);
        if(!user){
            console.error("User not found in DB");
            return;
        }
        const chat = store.addChat(payload.userId, user.name, payload.roomId, payload.message)
        if(!chat){
            return;
        }

        // broadcast logic here
        const outgoingPayload : OutgoingMessage= {
            type : OutgoingSupportedMessages.AddChat,
            payload : {
                chatId : chat?.id,
                roomId : payload.roomId,
                name : user.name,
                message : payload.message,
                upvote : 0
            }
        }

        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }

    
    if(message.type === SupportedMessage.UpvoteMessage){
        const payload = message.payload;
        const chat = store.upvote(payload.userId, payload.roomId,payload.chatId);
        if(!chat){
            return ;
        }

        const outgoingPayload : OutgoingMessage= {
            type : OutgoingSupportedMessages.UpdateChat,
            payload : {
                chatId : payload.chatId,
                roomId : payload.roomId,
                upvote : chat.upvotes.length
            }
        }

        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload)
    }
}