import React, { useState, useEffect, FormEvent } from 'react';
import { useProfile } from '../hooks/useProfile';
// import { Profile } from '../services/profile'; // Removed unused import
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import Navbar from '../components/layout/Navbar'; // Ensure Navbar is imported if used
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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <Navbar /> {/* Include Navbar if it's part of the layout */}
      <h1>Settings</h1> {/* Updated heading */}
      <p>Welcome, {displayEmail}</p>

      <form onSubmit={handleSubmit}>
        {/* Removed Avatar Upload Section */}

        {/* Email Field (Display Only) */}
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input 
            type="email" 
            id="email" 
            value={displayEmail} // Display user's actual email
            disabled 
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        
        {/* Username Field */}
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username</label>
          <input 
            type="text" 
            id="username" 
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (usernameError) setUsernameError(null); // Clear error when user types
            }}
            required // Make username required if needed
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            disabled={isUpdatingProfile} // Disable input while updating
          />
          {/* Display Validation Error */}
          {usernameError && <p style={{ color: 'red' }}>{usernameError}</p>}
        </div>
        
        {/* Removed Bio Field */}

        {/* TODO: Add other settings fields based on PRD profile schema (e.g., agent_ask_preference) */}
        
        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isUpdatingProfile}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          {isUpdatingProfile ? 'Saving...' : 'Save Username'}
        </button>
        {/* Display mutation error */} 
        {isUpdateError && (
          <p style={{ color: 'red' }}>
            Error: {updateError?.message || 'Failed to save username.'}
          </p>
        )}
      </form>
    </div>
  );
};

export default SettingsPage; // Renamed export 