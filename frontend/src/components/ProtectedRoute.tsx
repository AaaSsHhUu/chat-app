import { WebSocketProvider } from "@/context/WebSocketContext";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "./Loader";
import type { RootState } from "@/app/store";

function ProtectedRoute() {
    const {user, loading} = useSelector((state: RootState) => state.auth);
    console.log("user - ", user);

    if(loading) return <Loader />

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <WebSocketProvider user={user}>
            <Outlet />
        </WebSocketProvider>
    )
}

export default ProtectedRoute
