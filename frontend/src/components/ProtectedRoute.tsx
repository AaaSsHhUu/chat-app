import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { clearUser, setUser } from "@/features/auth/authSlice";
import { auth } from "@/firebase";
import Loader from "./Loader";

function ProtectedRoute() {
    const dispatch = useDispatch();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const currentUser = useSelector((state: any) => state.auth.user);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch(
                    setUser(user)
                );
            } else {
                dispatch(clearUser());
            }
            setCheckingAuth(false);
        });

        return () => unsubscribe();
    }, [dispatch])

    if (checkingAuth) {
        return <Loader />;
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
}

export default ProtectedRoute
