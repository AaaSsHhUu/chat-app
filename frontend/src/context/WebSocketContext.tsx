import { getAuth } from "firebase/auth";
import { createContext, useContext, useEffect, useRef } from "react";

const WebSocketContext = createContext<WebSocket | null>(null);

export const WebSocketProvider = ({children} : {children : React.ReactNode}) => {
    const socketRef = useRef<WebSocket | null>(null);
    // You don’t want React to re-render the component whenever the socket changes (which useState would do).
    useEffect(() => {
        socketRef.current = new WebSocket("ws://localhost:8080");

        socketRef.current.onopen = async () => {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken();
            socketRef.current?.send(JSON.stringify({
                type : "auth",
                payload : {
                    token
                }
            }))
        }

        return socketRef.current?.close();
    },[])

    return (
        <WebSocketContext.Provider value={socketRef.current}>
            {children}
        </WebSocketContext.Provider>
    )
}

const useSocket = () => useContext(WebSocketContext);
export default useSocket;