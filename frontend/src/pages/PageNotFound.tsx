import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate

  /**
   * Handles the click event for the "Go to Homepage" button.
   * Navigates the user to the root path of the application.
   */
  const handleGoHome = () => {
    navigate('/'); // Navigate to the home page
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-lg shadow-xl max-w-lg w-full">
        {/* 404 Heading */}
        <h1 className="text-9xl font-extrabold text-blue-500 dark:text-blue-400 mb-4">404</h1>
        {/* Page Not Found Title */}
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Page Not Found</h2>
        {/* Explanatory Message */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        {/* Go to Homepage Button */}
        <button
          onClick={handleGoHome}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-lg transition-colors duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;