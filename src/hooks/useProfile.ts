import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile as getProfileService, updateProfile as updateProfileService, Profile } from '../services/profile';
// Assuming you have an AuthContext or similar to check user status
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed

// Define a consistent query key base
const PROFILE_QUERY_KEY_BASE = 'profile';

// Define the shape of the mutation variables - This is the object updateProfileService expects
// It's just the partial profile data.
interface UpdateProfileVariables extends Partial<Profile> {}

// Define the shape of the hook's return value explicitly
interface UseProfileResult {
  // Profile data and query state
  profile: Profile | null;
  isLoadingProfile: boolean;
  isErrorProfile: boolean;
  profileError: Error | null;
  refetchProfile: () => void;

  // Profile update mutation state and function
  updateProfile: (variables: UpdateProfileVariables) => void;
  isUpdatingProfile: boolean;
  isUpdateError: boolean;
  updateError: Error | null;
}

export function useProfile(): UseProfileResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id; // Needed for queryKey invalidation and enabling query

  // Query for fetching the profile
  const profileQuery = useQuery<Profile | null, Error>({
    // Query key depends on the user being logged in
    queryKey: [PROFILE_QUERY_KEY_BASE, userId], 
    // getProfileService takes NO arguments
    queryFn: getProfileService, 
    // Only run the query if the userId exists (user is logged in)
    enabled: !!userId, 
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,   
  });

  // Mutation for updating the profile
  const profileMutation = useMutation<Profile | null, Error, UpdateProfileVariables>({
    // updateProfileService takes ONE argument: the partial profile object
    mutationFn: async (variables: UpdateProfileVariables) => {
      return updateProfileService(variables);
    },
    onSuccess: (data) => {
      // Invalidate the profile query based on the current user ID to refetch
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY_BASE, userId] });
      console.log('Profile update successful, invalidated query for user:', userId, data);
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    },
  });

  // Construct the return object matching UseProfileResult interface
  return {
    // Profile data and query state
    profile: profileQuery.data ?? null,
    isLoadingProfile: profileQuery.isLoading,
    isErrorProfile: profileQuery.isError,
    profileError: profileQuery.error || null,
    refetchProfile: () => { profileQuery.refetch(); },

    // Profile update mutation state and function
    updateProfile: profileMutation.mutate,
    isUpdatingProfile: profileMutation.isPending,
    isUpdateError: profileMutation.isError,
    updateError: profileMutation.error || null,
  };
} 