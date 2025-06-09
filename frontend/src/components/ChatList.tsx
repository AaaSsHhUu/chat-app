import { Link, useParams } from "react-router-dom";

interface ChatItem {
    roomId: string;
    roomName: string;
    profileImg: string;
    lastMessage: string;
    lastMessageTime: string | Date;
    unreadCount : number;
}

const chatList: ChatItem[] = [
    {
        roomId: "abc123",
        roomName: "Study Group",
        profileImg: "https://imgs.search.brave.com/olU1frCI_rKOD3-NBWDPcqTpdn8YDMNYb2wVQ2TmqlM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc",
        lastMessage: "Kal Exam hai!!!",
        lastMessageTime: "10:30 PM",
        unreadCount: 2,
    },
    {
        roomId: "def123",
        roomName: "Devs Group",
        profileImg: "https://imgs.search.brave.com/olU1frCI_rKOD3-NBWDPcqTpdn8YDMNYb2wVQ2TmqlM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc",
        lastMessage: "Let's build something :), like a chat application for the users",
        lastMessageTime: "10:30 PM",
        unreadCount: 4,
    },
    {
        roomId: "ghi123",
        roomName: "Ashu",
        profileImg: "https://imgs.search.brave.com/olU1frCI_rKOD3-NBWDPcqTpdn8YDMNYb2wVQ2TmqlM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc",
        lastMessage: "",
        lastMessageTime: "10:30 PM",
        unreadCount: 0,
    },
]

function ChatList() {

    const {roomId} = useParams();

    return (
        <div className="w-full bg-white dark:bg-slate-900 sm:w-full md:w-[30%] lg:w-80 h-full">
            <div className="flex flex-col w-full">
                {chatList.map((chat) => (
                    <Link 
                        to={`/${chat.roomId}`} 
                        key={chat.roomId}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${roomId === chat.roomId ? "bg-gray-300" : "hover:bg-gray-200 dark:hover:bg-slate-800"}`}
                    >
                        <img src={chat.profileImg} alt="user image" className="rounded-full w-10 h-10 object-cover" />
                        <div className="flex-1">
                            <div className="font-semibold text-black dark:text-white">
                                {chat.roomName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-300 truncate">
                                {chat.lastMessage.length > 25 ? chat.lastMessage.slice(0,20) + " ..." : chat.lastMessage}
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400">{chat.lastMessageTime.toString()}</span>
                            {
                                chat.unreadCount > 0 && (
                                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 mt-1">{chat.unreadCount}</span>
                                )
                            }
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default ChatList