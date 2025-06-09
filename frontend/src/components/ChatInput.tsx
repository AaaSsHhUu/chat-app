import { useState } from "react";

function ChatInput() {
    const [message, setMessage] = useState<string>("");

    return (
        <div className="align-bottom bottom-2 w-[98%] flex items-center gap-1 mt-2">
            <input
                type="text"
                placeholder="Enter Message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-gray-100 dark:bg-slate-200 text-black outline-none px-4 py-2 rounded-md"
            />
            <button className="px-4 py-2 cursor-pointer hover:bg-blue-700 text-white rounded-md bg-blue-800">

                Send
            </button>
        </div>
    );
}

export default ChatInput;
