import { useEffect, useRef, useState } from 'react';
import { CiEdit } from "react-icons/ci";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import { toast } from 'sonner';
import { Button } from './ui/button';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { getAuth } from 'firebase/auth';
import Loader from './Loader';

// Replace this with your actual user fetching logic
const fetchUserProfile = async () => {
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken();

  const res = await axios.get(`/api/user/profile`, {
    headers : {
      "Authorization" : `Bearer ${token}`
    }
  });
  console.log("res of profile - ", res);
  return res.data || {
    uid: 'someUserId123',
    username: 'Ashu Negi',
    email: 'ashu.negi@example.com',
    profileImg: 'https://imgs.search.brave.com/olU1frCI_rKOD3-NBWDPcqTpdn8YDMNYb2wVQ2TmqlM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc',
    joinedAt: '12 Jan 2025'
  };
};

function ProfileSetting() {
  const [username, setUsername] = useState<string>(''); // Component's username
  const [originalUsername, setOriginalUsername] = useState<string>(''); // From DB
  const [email, setEmail] = useState<string>(''); // From DB
  const [profileImg, setProfileImg] = useState<string>(''); // Component's Image url
  const [originalProfileImg, setOriginalProfileImg] = useState<string>(''); // URL From DB
  const [joinedAt, setJoinedAt] = useState<string>(''); // From DB
  const [isUsernameEditing, setIsUsernameEditing] = useState<boolean>(false); // When to show input for changing username
  const [hasProfileChanged, setHasProfileChanged] = useState<boolean>(false); // When we change profile
  const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null); // new profile image
  const [previewImage, setPreviewImage] = useState<string>(''); // new profile image preview
  const [saveLoading, setSaveLoading] = useState<boolean>(false); // loading for save db call
  const [fetchLoading, setFetchLoading] = useState<boolean>(false); // loading for fetch db call

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch user profile from backend
    setFetchLoading(true);
    try {
      fetchUserProfile().then(user => {
        console.log("user : ", user);
        setUsername(user.username);
        setOriginalUsername(user.username);
        setEmail(user.email);
        setProfileImg(user.profileImg);
        setOriginalProfileImg(user.profileImg);
        setJoinedAt(user.joinedAt);
        setPreviewImage('');
        setHasProfileChanged(false);
        setNewProfileImageFile(null);
      });
    } catch (error) {
      console.log("error fetching data - ", error);
      toast.error("Something went wrong");
    }
    finally{
      setFetchLoading(false);
    }
  }, []);

  // Detect changes
  useEffect(() => {
      if (
        (username && username !== originalUsername) ||
        (previewImage && previewImage !== originalProfileImg)
      ) {
        setHasProfileChanged(true);
      } else {
        setHasProfileChanged(false);
      }
  }, [username, originalUsername, previewImage, originalProfileImg]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewProfileImageFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUsernameChange = async () => {
    if (username.trim() === '') {
      toast.error("Username cannot be Empty");
      return;
    }
    if (username.trim() === originalUsername.trim()) {
      setIsUsernameEditing(false);
      return;
    }
    setIsUsernameEditing(false);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    let imageUrl = profileImg;

    try {
      // If a new image is selected, upload to Firebase Storage
      if (newProfileImageFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `profileImages/${username}_${Date.now()}`);
        await uploadBytes(storageRef, newProfileImageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Update backend
      await axios.put('/api/user/profile', {
        username,
        profileImg: imageUrl,
      });

      setOriginalUsername(username);
      setOriginalProfileImg(imageUrl);
      setProfileImg(imageUrl);
      setPreviewImage('');
      setNewProfileImageFile(null);
      setHasProfileChanged(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername(originalUsername);
    setProfileImg(originalProfileImg);
    setPreviewImage('');
    setNewProfileImageFile(null);
    setIsUsernameEditing(false);
    setHasProfileChanged(false);
  };

  if(fetchLoading){
    return <Loader />
  }

  return (
    <div className="w-full p-6 sm:p-8 rounded-lg flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h2>

      {/* Profile Image */}
      <div className="relative mb-6">
        <div
          className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 dark:border-blue-400 bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer group"
          onClick={handleImageClick}
        >
          {fetchLoading ? (
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
          ) : (
            <>
              <img
                src={previewImage || profileImg}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-sm font-semibold">Upload New</span>
              </div>
            </>
          )}
        </div>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Username */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          {isUsernameEditing ? (
            <input
              type="text"
              id="username"
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          ) : (
            <p className="flex-grow p-2 text-lg font-semibold text-gray-900 dark:text-white">
              {username}
            </p>
          )}
          {!isUsernameEditing ?
            <button className='cursor-pointer' onClick={() => setIsUsernameEditing(true)}>
              <CiEdit />
            </button>
            :
            <div className='flex items-center gap-3'>
              <button className='cursor-pointer' onClick={handleUsernameChange}>
                <TiTick />
              </button>
              <button className='cursor-pointer' onClick={() => setIsUsernameEditing(false)}>
                <IoMdCloseCircleOutline />
              </button>
            </div>
          }
        </div>
      </div>

      {/* Email */}
      <div className="mb-4 w-full max-w-sm">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
        <input
          type="email"
          id="email"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
          value={email}
          readOnly
        />
      </div>

      {/* Joined At */}
      <div className="w-full max-w-sm">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Joined At</label>
        <p className="w-full p-2 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md">
          {joinedAt}
        </p>
      </div>

      {/* Final changes buttons */}
      {hasProfileChanged &&
        <div className='mt-4 flex items-center gap-3'>
          <Button onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? "Saving..." : "Save"}
          </Button>
          <Button variant={"destructive"} onClick={handleCancel} disabled={saveLoading}>
            Cancel
          </Button>
        </div>
      }
    </div>
  );
}

export default ProfileSetting;