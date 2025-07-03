import { useParams } from "react-router-dom"
import ChatList from "../components/ChatList"
import ChatWindow from "../components/ChatWindow"

function Chats() {
  return (
    <div className="mt-18 flex items-center w-full" style={{height : "calc(100vh - 72px)"}}>
        <ChatList />
        <ChatWindow />
    </div>
  )
}

export default Chats