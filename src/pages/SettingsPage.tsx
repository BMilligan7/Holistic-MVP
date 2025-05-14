import React, { useState, useEffect, FormEvent } from 'react';
import { useProfile } from '../hooks/useProfile';
// import { Profile } from '../services/profile'; // Removed unused import
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
// import Navbar from '../components/layout/Navbar'; // Ensure Navbar is imported if used - REMOVING THIS LINE
// import AvatarUpload from '../components/profile/AvatarUpload'; // Removed import

const SettingsPage: React.FC = () => { // Renamed component here
  const { user } = useAuth(); // Get user from auth context
  const { 
    profile,
    isLoadingProfile,
    isErrorProfile,
    profileError,
    updateProfile, // This is the mutate function
    isUpdatingProfile, // Mutation pending state
    isUpdateError,     // Mutation error state
    updateError        // Mutation error object
  } = useProfile();

  // console.log('SettingsPage - isUpdatingProfile:', isUpdatingProfile); // Re-applying removal of debug log

  const [username, setUsername] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string | null>(null); // State for validation error
  // const [bio, setBio] = useState(''); // Removed bio state
  // const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(undefined); // Removed avatar state

  // State for other potential settings from PRD schema (Example)
  // const [agentAskPreference, setAgentAskPreference] = useState(''); 

  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
      // setBio(profile.bio || ''); // Removed bio update
      // setAvatarUrl(profile.avatar_url); // Removed avatar update
      // Example: setAgentAskPreference(profile.agent_ask_preference || 'ask'); 
    }
  }, [profile]);

  // Removed handleAvatarUploaded callback

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameError(null); 

    // Validation Logic
    if (!username.trim()) {
      setUsernameError('Username cannot be empty.');
      return;
    }
    if (username.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters long.');
      return;
    }
    if (!user) {
      setUsernameError('User not found. Please log in again.');
      return;
    }
    
    // Only call update if username has actually changed
    if (username === profile?.username) {
      setUsernameError('No changes detected.'); // Optional: Inform user
      return;
    }

    // Call the mutation function with ONLY the variables object
    updateProfile(
      { username } // Pass the object { username: value }
      // The onSuccess/onError callbacks are defined in the useProfile hook
      // We rely on the hook's isUpdateError and updateError states for feedback
    );
  };

  // Still need to investigate why profile might be null/undefined or why ID shows as loading
  const displayEmail = user?.email || 'Loading...'; // Use email from auth context

  if (!user) {
    // This should ideally be handled by the protected route, but good as a fallback
    return <p>Please log in to view settings.</p>;
  }

  if (isLoadingProfile) return <div>Loading profile...</div>; // Show loading only if profile is not yet available
  if (isErrorProfile) return <div>Error loading profile: {profileError?.message}</div>;

  return (
    // Apply Tailwind classes for overall page structure and form container
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* <Navbar /> NO LONGER RENDERING NAVBAR HERE */}
      <div className="max-w-xl mx-auto mt-8">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-2">Settings</h1> {/* Updated heading */}
          <p className="text-center text-sm text-gray-600 mb-8">Welcome, {displayEmail}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Removed Avatar Upload Section */}

            {/* Email Field (Display Only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input 
                  type="email" 
                  id="email" 
                  value={displayEmail} // Display user's actual email
                  disabled 
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
            
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input 
                  type="text" 
                  id="username" 
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (usernameError) setUsernameError(null); // Clear error when user types
                  }}
                  required // Make username required if needed
                  className={`appearance-none block w-full px-3 py-2 border ${usernameError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition duration-150 ease-in-out`}
                  disabled={isUpdatingProfile} // Disable input while updating
                />
              </div>
              {/* Display Validation Error */}
              {usernameError && <p className="mt-2 text-sm text-red-600">{usernameError}</p>}
            </div>
            
            {/* Removed Bio Field */}

            {/* TODO: Add other settings fields based on PRD profile schema (e.g., agent_ask_preference) */}
            
            {/* Submit Button */}
            <div>
              <button 
                type="submit" 
                disabled={isUpdatingProfile}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Username'}
              </button>
            </div>
            {/* Display mutation error */} 
            {isUpdateError && (
              <p className="mt-2 text-sm text-center text-red-600">
                Error: {updateError?.message || 'Failed to save username.'}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; // Renamed export 