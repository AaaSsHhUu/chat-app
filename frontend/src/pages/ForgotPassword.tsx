import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const auth = getAuth();

  if(auth.currentUser){
    navigate("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        await sendPasswordResetEmail(auth, email);
        toast.success(`A password reset link has been sent to your email ${email}`);
        setEmail("");
    } catch (error) {
        toast.error("Failed to send email, Please Try again!")
        console.log("error sending email - ", error);
    }
    finally{
        setLoading(false);
        navigate("/login")
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 w-full max-w-sm"
      >
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
          Forgot Password
        </h2>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your email"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Forgot
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword