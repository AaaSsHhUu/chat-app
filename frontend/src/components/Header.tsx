import { useState } from "react"
import PeerChatLogo from "./Logo"
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { IoMdSettings } from "react-icons/io";
import { getAuth, signOut } from "firebase/auth";
import { toast } from "sonner";

function Header() {
    const [showMenuOptions, setShowMenuOptions] = useState<boolean>(false);

    const auth = getAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const res = await signOut(auth);
            console.log("sign out res : ", res);
            toast.success("Logged out successfully");
            navigate("/login");
        } catch (error) {
            console.log("Error signing out - ", error);
            toast.error("Error Signing out, Please try again!!!")
        }
    }

    return (
        <header className="fixed max-h-18 top-0 left-0 w-full flex items-center justify-between p-4 bg-gray-300 dark:bg-gray-800 text-white shadow-md font-sans">
            {/* Left Section: Logo */}
            <Link to={"/"}>
                <PeerChatLogo />
            </Link>

            {/* Right Section: Menu Button */}
            <button
                onClick={() => setShowMenuOptions(prev => !prev)}
                className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                aria-label="Toggle menu" // Good for accessibility
            >
                {/* Hamburger Icon (SVG) */}
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                </svg>
            </button>

            {/* Menu Dropdown */}
            {showMenuOptions && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-white/30 backdrop-blur-xs"
                        onClick={() => setShowMenuOptions(false)}
                        aria-hidden="true"
                    />
                    {/* Menu Box */}
                    <div
                        className="fixed top-16 right-4 z-50 w-38 max-w-xs bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-4 px-2 flex flex-col items-start"
                        tabIndex={-1}
                    >
                        
                        <Link to={"/settings/profile"} className="flex items-center w-full px-2 py-2 rounded-md gap-2 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setShowMenuOptions(false)}>
                            <FaUser /> 
                            <span className="flex-1">Profile</span>
                        </Link>
                        
                        <Link to={"/settings/profile"} className="flex items-center w-full px-2 py-2 rounded-md gap-2 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setShowMenuOptions(false)}>
                            <IoMdSettings size={20} /> 
                            <span className="flex-1">Settings</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-700 text-white rounded-md text-sm font-semibold w-full mt-3 hover:cursor-pointer hover:opacity-90"
                        >Logout</button>                        
                    </div>
                </>
            )}
        </header>
    )
}

export default Header