import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";

const AuthContext = createContext<{ user: User | null }>({ user: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);
export default useAuth;

// You don't provide the user value to setUser directly in your useEffect because onAuthStateChanged is designed to be the source of that user value, and it automatically passes it as an argument to the callback function you provide (which in this case is your setUser state setter). This is a very common and powerful pattern for integrating external event-driven APIs with React state.