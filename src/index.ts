import {server as WebSockerServer} from "websocket";
import http from "http";

const server = http.createServer((request : any, response : any) => {
    console.log((new Date()) + " Recieved Request from " + request.url);
    response.writeHead(404);
    response.end();
});

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
            console.log("Received message " + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary'){
            console.log(`Received binary message of ${message.binaryData.length} bytes`);
        }
    });
    connection.on("close", function(reasonCode, description){
        console.log(new Date() + ` Peer ${connection.remoteAddress} disconnected`);
    })
})

