import React, { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { Profile } from '../services/profile';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
// import AvatarUpload from '../components/profile/AvatarUpload'; // Removed import

const SettingsPage: React.FC = () => { // Renamed component here
  const { user } = useAuth(); // Get user from auth context
  const { 
    profile,
    isLoadingProfile,
    profileError,
    isUpdatingProfile,
    updateProfileError,
    updateProfile 
  } = useProfile();

  // console.log('SettingsPage - isUpdatingProfile:', isUpdatingProfile); // Re-applying removal of debug log

  const [username, setUsername] = useState('');
  // const [bio, setBio] = useState(''); // Removed bio state
  // const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(undefined); // Removed avatar state

  // State for other potential settings from PRD schema (Example)
  // const [agentAskPreference, setAgentAskPreference] = useState(''); 

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      // setBio(profile.bio || ''); // Removed bio update
      // setAvatarUrl(profile.avatar_url); // Removed avatar update
      // Example: setAgentAskPreference(profile.agent_ask_preference || 'ask'); 
    }
  }, [profile]);

  // Removed handleAvatarUploaded callback

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedProfileData: Partial<Profile> = {};
    
    // Check if fields have changed compared to the fetched profile
    if (username !== profile?.username) updatedProfileData.username = username;
    // if (bio !== profile?.bio) updatedProfileData.bio = bio; // Removed bio check
    // if (avatarUrl !== profile?.avatar_url) updatedProfileData.avatar_url = avatarUrl || ''; // Removed avatar check
    // Example: if (agentAskPreference !== profile?.agent_ask_preference) updatedProfileData.agent_ask_preference = agentAskPreference;

    if (Object.keys(updatedProfileData).length > 0) {
      console.log('Updating profile with:', updatedProfileData);
      // Send only changed data relevant to PRD scope (e.g., username)
      updateProfile(updatedProfileData as Profile);
    }
  };

  // Still need to investigate why profile might be null/undefined or why ID shows as loading
  const displayEmail = user?.email || 'Loading...'; // Use email from auth context

  if (isLoadingProfile && !profile) return <div>Loading profile...</div>; // Show loading only if profile is not yet available
  if (profileError) return <div>Error loading profile: {profileError.message}</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Settings</h1> {/* Updated heading */}
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
            onChange={(e) => setUsername(e.target.value)}
            required // Make username required if needed
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        
        {/* Removed Bio Field */}

        {/* TODO: Add other settings fields based on PRD profile schema (e.g., agent_ask_preference) */}
        
        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isUpdatingProfile}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          {isUpdatingProfile ? 'Saving...' : 'Save Settings'}
        </button>
        {updateProfileError && <div style={{ color: 'red', marginTop: '10px' }}>Error saving settings: {updateProfileError.message}</div>}
      </form>
    </div>
  );
};

export default SettingsPage; // Renamed export 