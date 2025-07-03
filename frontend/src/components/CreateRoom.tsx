import { useEffect, useState, type FormEvent } from 'react';
import { MdEmail, MdGroups } from 'react-icons/md';
import { FaPlus } from "react-icons/fa6";
import { CiTrash } from "react-icons/ci";
import { toast } from 'sonner';
import useSocket from '@/context/WebSocketContext';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';

const CreateRoom = ({
  setShowAddUserDialog
}: { setShowAddUserDialog: React.Dispatch<React.SetStateAction<boolean>> }
) => {

  const [activeTab, setActiveTab] = useState('oneToOne');

  // States for the 1-on-1 chat tab
  const [oneToOneEmail, setOneToOneEmail] = useState<string>('');
  const [oneToOneError, setOneToOneError] = useState('');

  // States for the group chat tab
  const [groupInputEmail, setGroupInputEmail] = useState<string>('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [groupInputError, setGroupInputError] = useState('');

  const [loading, setLoading] = useState<boolean>(false);

  const user = useSelector((state : RootState) => state.auth.user);

  // Helper function for basic email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleSocketServerMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        console.log("ws server msg - ", data);
        if (data.type === "room-created") {
          toast.success("Room created successfully");

        }
        else if (data.type === "error") {
          toast.error(data.message || "Failed to create room");
        }
      } catch (error) {
        toast.error("Something went wrong!!!");
      }
      finally {
        setLoading(false);
        setShowAddUserDialog(false);
      }
    }

    socket.addEventListener("message", handleSocketServerMessage);

    // Cleanup on unmount
    return () => socket.removeEventListener("message", handleSocketServerMessage);
  }, [socket])

  // Handler for 1-on-1 chat form submission
  const handleOneToOneSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!oneToOneEmail) {
      toast.error('Email cannot be empty');
      return;
    }
    if (!isValidEmail(oneToOneEmail)) {
      toast.error('Please enter a valid email address')
      return;
    }

    console.log("one2one called - ", oneToOneEmail);

    try {
      setLoading(true);
      console.log("sending create room msg");
      socket?.send(JSON.stringify({
        type: "create-one-to-one-room",
        payload: {
          userEmail: oneToOneEmail,
          creatorEmail : user?.email
        }
      }))
    } catch (error) {
      console.log("room creation error - ", error);
      toast.error("Something went wrong, Room creation failed!!!");
    }
    finally {
      setOneToOneError('');
      setOneToOneEmail('');
      setShowAddUserDialog(false);
    }
  };

  // Handler for adding a member to the group chat list
  const handleAddGroupMember = () => {
    if (!groupInputEmail) {
      setGroupInputError('Email cannot be empty.');
      return;
    }
    if (!isValidEmail(groupInputEmail)) {
      setGroupInputError('Please enter a valid email address.');
      return;
    }
    // Check if the email is already in the list to avoid duplicates
    if (groupMembers.includes(groupInputEmail)) {
      setGroupInputError('Email already added to the group.');
      return;
    }

    // Add the new email to the group members list
    setGroupMembers([...groupMembers, groupInputEmail]);
    setGroupInputEmail('');
    setGroupInputError('');
  };

  // Handler for removing a member from the group chat list
  const handleRemoveGroupMember = (emailToRemove: string) => {
    // Filter out the email to be removed from the list
    setGroupMembers(groupMembers.filter(email => email !== emailToRemove));
  };

  // Handler for group chat form submission
  const handleGroupChatSubmit = () => {
    // Ensure there are at least two members for a group chat
    if (groupMembers.length < 2) {
      toast.error('Please add at least two members for a group chat');
      return;
    }
    // Clear any previous error
    setGroupInputError('');

    // Log the group members and show an alert (in a real app, you'd send this to your backend)
    console.log('Starting group chat with:', groupMembers);
    alert(`Starting group chat with: ${groupMembers.join(', ')}`); // Using alert for demonstration

    // Clear the group members list and input field after submission
    setGroupMembers([]);
    setGroupInputEmail('');
  };

  return (
    <div className="z-50 fixed top-1/5 rounded-sm left-1/3 max-w-[40vw] w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 font-sans antialiased">
      {/* Main container for the chat form */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Start a New Chat</h2>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-3 px-4 text-center text-lg font-medium rounded-t-lg transition-all duration-300 focus:outline-none ${activeTab === 'oneToOne'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            onClick={() => setActiveTab('oneToOne')}
          >
            <MdEmail className="inline-block mr-2" size={20} /> 1-on-1 Chat
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center text-lg font-medium rounded-t-lg transition-all duration-300 focus:outline-none ${activeTab === 'group'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            onClick={() => setActiveTab('group')}
          >
            <MdGroups className="inline-block mr-2" size={20} /> Group Chat
          </button>
        </div>

        {/* Tab Content - 1-on-1 Chat */}
        {activeTab === 'oneToOne' && (
          <form onSubmit={handleOneToOneSubmit} className="space-y-6">
            <div>
              <label htmlFor="oneToOneEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                User Email
              </label>
              <input
                type="text"
                id="oneToOneEmail"
                name="oneToOneEmail"
                placeholder="enter user email"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200 ${oneToOneError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                value={oneToOneEmail}
                onChange={(e) => {
                  setOneToOneEmail(e.target.value);
                  if (oneToOneError) setOneToOneError(''); // Clear error on input change
                }}
              />
              {/* Display 1-on-1 error message */}
              {oneToOneError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{oneToOneError}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 dark:bg-indigo-500 text-white dark:text-gray-100 py-3 px-6 rounded-lg font-semibold text-lg shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
            >
              Start 1-on-1 Chat
            </button>
          </form>
        )}

        {/* Tab Content - Group Chat */}
        {activeTab === 'group' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="groupInputEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Add Members to Group
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  id="groupInputEmail"
                  name="groupInputEmail"
                  placeholder="enter member email"
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200 ${groupInputError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                  value={groupInputEmail}
                  onChange={(e) => {
                    setGroupInputEmail(e.target.value);
                    if (groupInputError) setGroupInputError(''); // Clear error on input change
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddGroupMember}
                  className="p-2 bg-indigo-500 dark:bg-indigo-600 text-white dark:text-gray-100 rounded-full shadow-md hover:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform transform hover:scale-110"
                  aria-label="Add member"
                >
                  <FaPlus size={20} />
                </button>
              </div>
              {/* Display group input error message */}
              {groupInputError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{groupInputError}</p>}
            </div>

            {/* Display list of added group members */}
            {groupMembers.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200">Current Group Members:</h3>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {groupMembers.map((email) => (
                    <li key={email} className="flex items-center justify-between py-2">
                      <span className="text-gray-800 dark:text-gray-100 text-sm break-all">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGroupMember(email)}
                        className="ml-4 p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-full transition-colors duration-200"
                        aria-label={`Remove ${email}`}
                      >
                        <CiTrash size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={handleGroupChatSubmit}
              className="w-full bg-indigo-600 dark:bg-indigo-500 text-white dark:text-gray-100 py-3 px-6 rounded-lg font-semibold text-lg shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
            >
              Start Group Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoom;
