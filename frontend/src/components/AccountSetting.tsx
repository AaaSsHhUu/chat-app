import { useTheme } from "@/context/ThemeContext";
import { deleteUser, EmailAuthProvider, getAuth, reauthenticateWithCredential, signOut, updatePassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import axios from "axios";

function AccountSetting() {
    // Use a single state object for all password fields
    const [passwords, setPasswords] = useState<{ old: string; new: string; confirm: string }>({
        old: "",
        new: "",
        confirm: ""
    });
    const [delAccInput, setDelAccInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    // Show/hide password states for each field
    const [showPassword, setShowPassword] = useState<{ old: boolean; new: boolean; confirm: boolean }>({
        old: false,
        new: false,
        confirm: false
    });

    // State to control the dialogs visibility
    const [resetDialogOpen, setResetDialogOpen] = useState<boolean>(false);
    const [delAccDialogOpen, setDelAccDialogOpen] = useState<boolean>(false);

    const { theme, toggleTheme } = useTheme();

    const auth = getAuth();

    const navigate = useNavigate();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const user = auth.currentUser;

        if (!user) {
            navigate("/login");
            return;
        }

        // Checking if user is logged in via email-password method and not google signin
        const isEmailPasswordUser = user?.providerData.some((provider) => provider.providerId === "password");

        if (!isEmailPasswordUser) {
            toast.error("You have signed in via Google, You can't set new Password !!!");
            return;
        }

        if (passwords.new !== passwords.confirm) {
            toast.error("New password and confirm password do not match");
            return;
        }

        // Check whether old password is correct or not - firebase checking
        const credential = EmailAuthProvider.credential(user?.email!, passwords.old);

        try {
            setLoading(true);
            // Reauthenticate the user with the old password
            await reauthenticateWithCredential(user, credential);
            console.log("User successfully reauthenticated with old password");

            // If reauthentication succeed then update the password with new password
            // And redirect to login page after signing the user out
            await updatePassword(user, passwords.confirm);
            toast.success("Password updated successfully");
            await signOut(auth);
            navigate("/login");
        } catch (err: any) {
            console.log("Error updating password : ", err);
            if (err?.code === "auth/invalid-credential") {
                toast.error("The old password is incorrect");
                return;
            }
        }
        finally {
            setLoading(false);
            setPasswords({
                old: "",
                new: "",
                confirm: ""
            })
        }
    }

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        if (delAccInput !== "delete") {
            toast.error("Invalid input");
            return;
        }

        if(!auth.currentUser){
            navigate("/login");
            return ;
        }

        try {
            const accessToken = await auth.currentUser.getIdToken(); // This token is valid for few seconds even after deletion of the user from firebase
            
            // Delete account from firebase
            await deleteUser(auth.currentUser)

            // Delete user from backend
            await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/auth`, {
                headers : {
                    "Authorization" : `Bearer ${accessToken}`
                }
            })

            toast.success("Account Deleted");
            signOut(auth);
            navigate("/signup");
        } catch (error) {
            console.log("error in deletion of acc - ", error);
            toast.error("Failed to delete the Account, please try again later");
        }
    }

    return (
        <div className="w-full flex flex-col justify-start text-black dark:text-white">
            {/* Dark theme toggler */}
            <div className="bg-white text-black dark:bg-slate-800 dark:text-white flex items-center justify-between px-6 py-5 cursor-pointer border-b border-b-gray-500">
                Dark Theme
                <Switch checked={theme === "dark" ? true : false} onCheckedChange={toggleTheme} />
            </div>
            {/* Reset Password option */}
            <div className="bg-white text-black dark:bg-slate-800 dark:text-white flex items-center justify-between px-6 py-5 cursor-pointer border-b border-b-gray-500">
                Reset Password
                <Button className="cursor-pointer" onClick={() => setResetDialogOpen(prev => !prev)}>Reset</Button>
                {resetDialogOpen && (
                    <>
                        <div className="fixed inset-0 z-40 bg-white/30 dark:bg-black/30 backdrop-blur-sm" onClick={() => setResetDialogOpen(false)} />
                        <form
                            onSubmit={handleResetPassword}
                            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg flex flex-col gap-4 w-[90%] sm:w-[60%] md:w-[35%]"
                        >
                            <label className="flex flex-col gap-1 text-black dark:text-white">
                                Old Password
                                <div className="relative">
                                    <input
                                        type={showPassword.old ? "text" : "password"}
                                        className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-black dark:text-white w-full pr-10"
                                        placeholder="Enter old password"
                                        value={passwords.old}
                                        onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword((prev) => ({ ...prev, old: !prev.old }))}
                                    >
                                        {showPassword.old ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </label>
                            <label className="flex flex-col gap-1 text-black dark:text-white">
                                New Password
                                <div className="relative">
                                    <input
                                        type={showPassword.new ? "text" : "password"}
                                        className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-black dark:text-white w-full pr-10"
                                        placeholder="Enter new password"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
                                    >
                                        {showPassword.new ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </label>
                            <label className="flex flex-col gap-1 text-black dark:text-white">
                                Confirm Password
                                <div className="relative">
                                    <input
                                        type={showPassword.confirm ? "text" : "password"}
                                        className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-black dark:text-white w-full pr-10"
                                        placeholder="Confirm new password"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                                    >
                                        {showPassword.confirm ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </label>
                            <Button type="submit" disabled={loading} className={`mt-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}>Reset</Button>
                            <Button onClick={() => setResetDialogOpen(false)} variant={"destructive"}>Cancel</Button>
                        </form>
                    </>
                )}
            </div>
            {/* Delete Account option */}
            <div className="bg-white text-black dark:bg-slate-800 dark:text-white flex items-center justify-between px-6 py-5 cursor-pointer border-b border-b-gray-500">
                Delete Account
                <Button className="cursor-pointer" variant={"destructive"} onClick={() => setDelAccDialogOpen(true)}>Delete</Button>
                {
                    delAccDialogOpen && (
                        <>
                            <div className="fixed inset-0 bg-white/30 dark:bg-black/30 z-40 backdrop-blur-sm" onClick={() => setDelAccDialogOpen(false)} />

                            <form
                                onSubmit={handleDeleteAccount}
                                className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg flex flex-col gap-4 w-[90%] sm:w-[60%] md:w-[35%]"
                            >
                                <h1 className="flex flex-col text-center text-xl font-bold text-black dark:text-white">
                                    Delete Account !!! Are you Sure ?
                                </h1>
                                <p className="text-center text-sm opacity-80 text-black dark:text-white">write delete if you want to delete the account</p>
                                <input
                                    type="text"
                                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-black dark:text-white w-full pr-10"
                                    placeholder="delete"
                                    value={delAccInput}
                                    onChange={(e) => setDelAccInput(e.target.value)}
                                    required
                                />
                                <Button variant={"destructive"} className="cursor-pointer">Delete</Button>
                            </form>
                        </>
                    )
                }
            </div>
        </div>
    )
}

export default AccountSetting