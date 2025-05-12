import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

// Interface based on PRD schema (excluding fields not managed here yet)
export interface Profile {
  id?: string; // Usually the user_id from auth.users
  username?: string;
  // avatar_url?: string; // Removed per PRD scope
  // bio?: string; // Removed per PRD scope
  updated_at?: string;
  // Add other fields from PRD schema as needed (e.g., agent_ask_preference)
  agent_ask_preference?: string; // Example from PRD
}

// Function to get the current user from Supabase auth
const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Get a user's profile (only fields relevant to this management page)
export const getProfile = async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) {
    console.error('No user logged in');
    return null;
  }

  try {
    // Select only fields needed for the settings/profile page that ARE in the PRD schema
    const { data, error, status } = await supabase
      .from('profiles')
      .select(`username`) // Removed bio, avatar_url. Add other needed fields like agent_ask_preference
      .eq('id', user.id)
      .single();

    if (error && status !== 406) throw error; // 406 can mean no row, which is fine

    if (data) {
      return { ...data, id: user.id } as Profile;
    }
    // If no profile row exists yet, return just the ID.
    // The calling component should handle creating the initial row via an update/upsert.
    return { id: user.id }; 
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

// Update a user's profile
export const updateProfile = async (profile: Partial<Profile>): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) {
    console.error('No user logged in');
    return null;
  }

  // Ensure we only try to update fields that are actually defined in the input `profile` object
  // and are part of our defined Profile interface (or PRD schema)
  const profileDataToUpdate = {
    ...profile, // Contains only the fields passed in (e.g., username)
    id: user.id, // Ensure the id is the authenticated user's id for the upsert condition
    updated_at: new Date().toISOString(),
  };

  // Remove fields not intended for direct update or not present in input
  if (profileDataToUpdate.username === undefined) delete profileDataToUpdate.username;
  // Add similar checks for other potentially updatable fields from PRD
  // if (profileDataToUpdate.agent_ask_preference === undefined) delete profileDataToUpdate.agent_ask_preference;

  // Ensure the object is not empty except for id/updated_at before upserting
  const { id, updated_at, ...writableFields } = profileDataToUpdate;
  if (Object.keys(writableFields).length === 0) {
      console.log("No actual profile fields to update.");
      // Optionally fetch and return the current profile if needed
      const currentProfile = await getProfile(); 
      return currentProfile;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileDataToUpdate) // Upsert handles create or update based on PK (id)
      .select() // Select all columns from the updated/inserted row
      .single();

    if (error) throw error;
    console.log("Profile updated successfully:", data);
    return data as Profile;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}; 