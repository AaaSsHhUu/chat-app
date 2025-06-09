import { AuthenticatedSocket } from "./handlers";

// Helper functions (broadcast, sendToRoom, etc.)
export function sendSocketError(socket : AuthenticatedSocket, message : string){
    socket.send(JSON.stringify({
        type : "error",
        message
    }))
}
