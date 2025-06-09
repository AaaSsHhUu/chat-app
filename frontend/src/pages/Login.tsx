import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { toast } from "sonner";

function Login() {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleLoginWithCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await signInWithEmailAndPassword(auth, email, password);
            console.log("login res : ", res);
            toast.success("Login successfull");
            navigate("/");
        } catch (error: any) {
            console.log(error)
            setError(error?.message || "Some error occured in Login");
        }
        finally {
            setLoading(false);
        }
    }

    const { handleGoogleSignin, loading: googleLoading } = useGoogleAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans p-4">
            {/* Form Container */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">Login</h2>

                <form onSubmit={handleLoginWithCredentials} className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-gray-700 dark:text-gray-400 text-sm font-medium mb-1">Email</label>
                        <input
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            type="email"
                            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-gray-700 dark:text-gray-400 text-sm font-medium mb-1">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-300 focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={
                                        showPassword ? "Hide password" : "Show password"
                                    }
                                >
                                    {
                                        showPassword ? (
                                            <IoEyeOff />
                                        ) : (
                                            <IoEye />
                                        )
                                    }
                                </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-600 dark:text-red-400 text-sm text-center mt-4 p-2 bg-red-100 dark:bg-red-900 bg-opacity-30 rounded-md">
                            {error}
                        </div>
                    )}
                </form>

                {/* Optional: Link to Login */}
                <p className="text-center text-gray-700 dark:text-gray-400 text-sm mt-6">
                    Don't have an account ?{' '}
                    <a href="/signup" className="text-blue-600 dark:text-blue-500 hover:underline">Sign up</a>
                </p>

                <div className="relative w-full mt-4">
                    <hr className="text-gray-300 dark:text-gray-600" />
                    <span className="absolute -top-2 bg-white dark:bg-gray-800 left-[45%] text-gray-500 dark:text-gray-400 px-3 text-sm">OR</span>
                </div>
                <button
                    onClick={handleGoogleSignin}
                    className="w-full mt-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={googleLoading}
                >
                    <FcGoogle size={20} />
                    Sign in with Google
                </button>

                <hr />

                <Link 
                    to="/forgot-password" 
                    className="block text-center mt-3 text-sm text-blue-600 dark:text-blue-500 hover:underline"
                >
                    forgot password ?
                </Link>
            </div>
        </div>
    )
}

export default Login;
