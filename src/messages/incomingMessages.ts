import {z} from "zod";

export enum SupportedMessage{
    JoinRoom = "JOIN_ROOM",
    SendMessage = "SEND_MESSAGE",
    UpvoteMessage = "UPVOTE_MESSAGE"
}

export type IncomingMessage = {
    type : SupportedMessage.JoinRoom,
    payload : InitMessageType
} | {
    type : SupportedMessage.SendMessage,
    payload : UserMessageType
} | {
    type : SupportedMessage.UpvoteMessage,
    payload : UpvoteMessageType
}

export const InitMessage = z.object({
    name : z.string(),
    userId : z.string(),
    roomId : z.string()
})

export const UserMessage = z.object({
    userId : z.string(),
    roomId : z.string(),
    message : z.string(),
})

export const UpvoteMessage = z.object({
    chatId : z.string(),
    userId : z.string(),
    roomId : z.string()
})


export type InitMessageType = z.infer<typeof InitMessage>;
export type UserMessageType = z.infer<typeof UserMessage>;
export type UpvoteMessageType = z.infer<typeof UpvoteMessage>;

