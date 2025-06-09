// Typescript types for websocket
import { WebSocket } from "ws";

export type ConnectedUser = {
	socket: WebSocket;
	userId: string;
	roomId: string;
};

export type WSMessage =
  | { type: "create-room"; payload: { roomName: string; userId: string } }
  | { type: "join"; payload: { userId: string; roomId: string } }
  | { type: "leave"; payload: {roomId : string, userId : string} }
  | { type: "chat"; payload: { message: string, userId : string, roomId :string } }
  | { type : "auth"; payload : { token : string }}
  | { type : "typing"; payload : { roomId : string; typing : boolean; userId : string} } 

