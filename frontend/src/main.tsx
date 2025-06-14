import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import "./index.css";
import Chats from "./pages/Chats.tsx";
import Login from "./pages/Login.tsx";
import Settings from "./pages/Settings.tsx";
import Signup from "./pages/Signup.tsx";
import AccountSetting from "./components/AccountSetting.tsx";
import ProfileSetting from "./components/ProfileSetting.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import PageNotFound from "./pages/PageNotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.ts";
import { setUser } from "./features/auth/authSlice.ts";

onAuthStateChanged(auth, (user) => {
    store.dispatch(setUser(user));
})

createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <ThemeProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    richColors={true}
                />
                <Routes>
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<App />}>
                            <Route index element={<Chats />} /> {/* index makes a route the default child for its parent route. */}
                            <Route path="settings" element={<Settings />}>
                                <Route path="profile" element={<ProfileSetting />} />
                                <Route path="account" element={<AccountSetting />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="*" element={<PageNotFound />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    </Provider>
);
