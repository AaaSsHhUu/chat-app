// Typescript types for websocket
import { WebSocket } from "ws";

export type ConnectedUser = {
	socket: WebSocket;
	userId: string;
	roomId: string;
};

export type WSMessage =
  | { type: "create-one-to-one-room"; payload: { userEmail: string ; creatorEmail: string } }
  | { type: "create-one-to-many-room"; payload: { groupName : string; userEmails: string[] ; creatorEmail: string } }
  | { type: "join-room"; payload: { userId: string; roomId: string } }
  | { type: "leave-room"; payload: {roomId : string, userId : string} }
  | { type: "send-message"; payload: { message: string, userId : string, roomId :string } }
  | { type : "auth"; payload : { token : string }}
  | { type : "typing"; payload : { roomId : string; typing : boolean; userId : string} } 

