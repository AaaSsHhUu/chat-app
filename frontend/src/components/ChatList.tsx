import { Link, useParams } from "react-router-dom";
import { IoMdPersonAdd } from "react-icons/io";
import { useEffect, useState } from "react";
import axios from "axios";
import CreateRoom from "./CreateRoom";

interface ChatItem {
    roomId: string;
    roomName: string;
    profileImg: string;
    lastMessage: string;
    lastMessageTime: string | Date;
    unreadCount: number;
}

// const chatList: ChatItem[] = [
//     {
//         roomId: "abc123",
//         roomName: "Study Group",
//         profileImg: "https://imgs.search.brave.com/olU1frCI_rKOD3-NBWDPcqTpdn8YDMNYb2wVQ2TmqlM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc",
//         lastMessage: "Kal Exam hai!!!",
//         lastMessageTime: "10:30 PM",
//         unreadCount: 2,
//     },
//     {
//         roomId: "def123",
//         roomName: "Devs Group",
//         profileImg: "https://imgs.search.brave.com/olU1frCI_rKOD3-NBWDPcqTpdn8YDMNYb2wVQ2TmqlM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc",
//         lastMessage: "Let's build something :), like a chat application for the users",
//         lastMessageTime: "10:30 PM",
//         unreadCount: 4,
//     },
//     {
//         roomId: "ghi123",
//         roomName: "Ashu",
//         profileImg: "https://imgs.search.brave.com/olU1frCI_rKOD3-NBWDPcqTpdn8YDMNYb2wVQ2TmqlM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc",
//         lastMessage: "",
//         lastMessageTime: "10:30 PM",
//         unreadCount: 0,
//     },
// ]

// When you add a user by email, send a create-room message via WebSocket to your backend.
// Backend creates the room and adds both users.
// Backend should send a room-created event back to the client.
// On receiving room-created, update your chat list and optionally auto-select/join the new room.

function ChatList() {
    const [searchInput, setSearchInput] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [showAddUserDialog, setShowAddUserDialog] = useState<boolean>(false);
    const [chatList, setChatList] = useState<ChatItem[]>([]);

    const { roomId } = useParams();

    // useEffect(() => {
    //     const fetchChatList = async () => {
    //         const res = axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/`);
    //     }
    // }, [])

    // Filter chatlist
    const filterChatList = chatList.filter((chat) => chat.roomName.toLowerCase().includes(searchInput.toLowerCase()))

    // Add user
    const handleAddUser = (() => {
        // post req to add user
        // res -> 
        // a room with a name
    })

    return (
        <div className="w-full bg-white dark:bg-slate-900 sm:w-full md:w-[30%] lg:w-80 h-full">
            <div className="flex items-end my-2">
                <input
                    type="text"
                    className="px-4 py-2 flex-1 focus:border-b border-b-gray-500 dark:border-b-gray-300 dark:text-white/80 text-black/80 outline-none"
                    placeholder="Search username"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                <button className="px-3 py-1 text-gray-300 cursor-pointer hover:text-gray-100" onClick={() => setShowAddUserDialog(prev => !prev)}>
                    <IoMdPersonAdd size={20} />
                </button>
                {showAddUserDialog &&
                    <div>
                        <div className="fixed inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-sm z-50" onClick={() => setShowAddUserDialog(false)} />
                        <CreateRoom setShowAddUserDialog={setShowAddUserDialog} />
                    </div>
                }
            </div>
            <div className="flex flex-col w-full">
                {filterChatList.map((chat) => (
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
                                {chat.lastMessage.length > 25 ? chat.lastMessage.slice(0, 20) + " ..." : chat.lastMessage}
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