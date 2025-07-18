const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col items-center">
        {/* Spinning circle animation */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 dark:border-blue-400"></div>
        <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;