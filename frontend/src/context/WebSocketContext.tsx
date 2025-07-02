import { getAuth } from "firebase/auth";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext<WebSocket | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socketRef = useRef<WebSocket | null>(null); // You don’t want React to re-render the component whenever the socket changes (which useState would do).
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const connectSocket = async () => {
            socketRef.current = new WebSocket("ws://localhost:8080");

            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken();

            socketRef.current.onopen = () => {
                if (token) {
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