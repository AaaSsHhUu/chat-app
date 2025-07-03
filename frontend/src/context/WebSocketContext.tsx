import { getAuth, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext<WebSocket | null>(null);

export const WebSocketProvider = ({ user, children }: { user : User, children: React.ReactNode }) => {
    const socketRef = useRef<WebSocket | null>(null); // You don’t want React to re-render the component whenever the socket changes (which useState would do).
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const connectSocket = async () => {
            if(!user) return;
            
            const token = await user?.getIdToken();
            
            socketRef.current = new WebSocket("ws://localhost:8080");
            
            socketRef.current.onopen = () => {
                if (token) {
                    console.log("sending auth");
                    socketRef.current?.send(JSON.stringify({
                        type: "auth",
                        payload: { token }
                    }))
                }
                if (socketRef.current) {
                    socketRef.current.onerror = (err) => {
                        console.log("Wesocket error : ", err)
                    }
                }

                setSocket(socketRef.current)
            }
        }


        connectSocket();

        return () => {
            socketRef.current?.close();
        }
    }, [])

    return (
        <WebSocketContext.Provider value={socket}>
            {children}
        </WebSocketContext.Provider>
    )
}

const useSocket = () => useContext(WebSocketContext);
export default useSocket;