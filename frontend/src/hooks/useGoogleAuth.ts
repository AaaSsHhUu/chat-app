import {
    deleteUser,
    getAdditionalUserInfo,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { toast } from "sonner";
import axios from "axios";

export function useGoogleAuth() {
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleGoogleSignin = async () => {
        try {
            setLoading(true);
            const provider = new GoogleAuthProvider();
            const res = await signInWithPopup(auth, provider);
            console.log("google signin res : ", res);
            try {
                // Saving the user in DB if new
                const { isNewUser } = getAdditionalUserInfo(res)!;
                const accessToken = await res.user.getIdToken();
                const { uid, displayName, email, photoURL } = res.user;
                if (isNewUser) {
                    await axios.post(
                        `${import.meta.env.VITE_SERVER_URL}/auth`,
                        {
                            uid,
                            username: displayName,
                            userEmail : email,
                            profileImg: photoURL,
                        },
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${accessToken}`,
                            },
                        }
                    );
                }
                toast.success("Login Successfull");
                navigate("/");
            } catch (dbError) {
                // Remove if new user created in the firebase but not in db
                await deleteUser(res.user);
                console.log("Deleting created user in firebase");
                console.log("google signin db err - ", dbError);
                toast.error("Signin failed, try again later!");
            }
        } catch (error: any) {
            console.log("error in google signin - ", error);
            toast.error(error?.message || "Google sign-in failed");
        } finally {
            setLoading(false);
        }
    };

    return { handleGoogleSignin, loading };
}
