import { useEffect } from "react";
import { ChatBackground } from "./Chat-background";
import ChatInput from "./ChatInput";
import { useParams } from "react-router-dom";

const chatMessages = [
    {
        content: "Hi",
        sender: "Akash",
        time: "22:07"
    },
    {
        content: "How r u?",
        sender: "Akash",
        time: "22:08"
    },
    {
        content: "Hello",
        sender: "Prannit",
        time: "22:22"
    },
    {
        content: "I am good",
        sender: "Prannit",
        time: "22:02"
    },
    {
        content: "Hi",
        sender: "Akash",
        time: "22:07"
    },
    {
        content: "How r u?",
        sender: "Akash",
        time: "22:08"
    },
    {
        content: "Hello",
        sender: "Prannit",
        time: "22:22"
    },
    {
        content: "I am good",
        sender: "Prannit",
        time: "22:20"
    },
    {
        content: "Hi",
        sender: "Akash",
        time: "22:07"
    },
    {
        content: "How r u?",
        sender: "Akash",
        time: "22:08"
    },
    {
        content: "Hello",
        sender: "Prannit",
        time: "22:22"
    },
    {
        content: "I am good",
        sender: "Prannit",
        time: "22:20"
    },
]

function ChatWindow() {
    const currentUser = "Akash";
    const {roomId} = useParams();

    if(!roomId){
        return <div className="w-full flex justify-center items-center bg-transparent">
            <ChatBackground />
            <h1 className="text-3xl font-bold text-gray-500 dark:text-gray-200">Select Any Chat</h1>
        </div>
    }

    useEffect(() => {

    },[roomId])

    return (
        <div className="flex my-2 flex-1 md:w-3/4 rounded-md mx-auto bg-transparent">
            <ChatBackground className="w-full" />
            <div className="w-full flex flex-col justify-between px-3 h-[80vh]"> {/* Set a height for the chat window */}
                {/* Scrollable chat messages */}
                <div className="flex-1 overflow-y-auto py-2 hide-scrollbar">
                    {chatMessages.map((chat, idx) => (
                        <div key={idx} className="">
                            <div
                                className={`flex my-2 align-top ${chat.sender === currentUser ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`px-4 py-2 rounded-lg shadow 
                                    ${chat.sender === currentUser
                                            ? "bg-blue-400 text-white rounded-br-none"
                                            : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                                        }`}
                                >
                                        {
                                        chat.sender === currentUser ?
                                        <p className={`text-xs font-bold text-right`}>{chat.sender}</p>
                                        :
                                        <p className={`text-xs font-bol text-left`}>{chat.sender}</p>
                                    }
                                    <div className={`flex ${chat.sender === currentUser ? "flex-row-reverse" : "flex-row"} align-middle gap-3`}>
                                        <div className="text-sm">{chat.content}</div>
                                        <div className="text-xs text-right text-black/70 dark:text-gray-200/80 mt-1">{chat.time}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Chat input at the bottom */}
                <ChatInput />
            </div>
        </div>
    );
}

export default ChatWindow;
