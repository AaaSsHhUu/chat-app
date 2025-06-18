import { WebSocket } from "ws";

// Store userId -> Set of websockets (in case of multiple tabs)
const userSockets = new Map<string, Set<WebSocket>>();

// Store roomId -> Set of userId
const roomMembers = new Map<string, Set<string>>();

export const connectionManager = {
    // Called after auth
    addUserSocket(userId : string, socket : WebSocket){
        if(!userSockets.has(userId)){
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId)?.add(socket);
    },

    removeUserSocket(userId : string, socket : WebSocket){
        const sockets = userSockets.get(userId);
        if(socket){
            sockets?.delete(socket);
            if(sockets?.size === 0){
                userSockets.delete(userId);
            }
        }
    },

    getUserSockets(userId : string){
        return userSockets.get(userId);
    },

    // Room Managment
    addUserToRoom(userId : string, roomId : string){
        if(!roomMembers.has(roomId)){
            roomMembers.set(roomId, new Set());
        }
        roomMembers.get(roomId)?.add(userId);
    },

    removeUserFromRoom(userId : string, roomId : string){
        const members = roomMembers.get(roomId);
        if(members){
            members?.delete(userId);
            if(members.size === 0){
                roomMembers.delete(roomId)    ;
            }
        }
    },

    getRoomMembers(roomId : string){
        return roomMembers.get(roomId);
    },

    // Broadcast to a full room
    broadcastToRoom(roomId : string, message : any){
        const members = roomMembers.get(roomId);

        if(!members) return ;

        members.forEach((userId) => {
            const sockets = userSockets.get(userId);

            sockets?.forEach(socket => {
                socket.send(JSON.stringify(message))
            })
        })
    },

    broadcastToSingleUser(userId : string, message : any){
        const sockets = userSockets.get(userId);
        if(!sockets) return;

        sockets.forEach(socket => {
            socket.send(JSON.stringify(message))
        })
    },

    removeSocketCompletely(socket : WebSocket){
        for(let [userId, sockets] of userSockets.entries()){
            if(sockets.has(socket)){
                sockets.delete(socket);
                if(sockets.size === 0){
                    userSockets.delete(userId);
                    // For cleaning up room membership too
                    for(const [roomId, members] of roomMembers.entries()){
                        members.delete(roomId);
                        if(members.size === 0){
                            roomMembers.delete(roomId);
                        }
                    }
                }
                break;
            }
        }
    }
}