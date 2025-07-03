import { WebSocketProvider } from "@/context/WebSocketContext";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
    const currentUser = useSelector((state: any) => state.auth.user);

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return (
        <WebSocketProvider user={currentUser}>
            <Outlet />
        </WebSocketProvider>
    )
}

export default ProtectedRoute
