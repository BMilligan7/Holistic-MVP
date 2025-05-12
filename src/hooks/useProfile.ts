import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { getProfile, updateProfile, Profile } from '../services/profile';
// Assuming you have an AuthContext or similar to check user status
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed

const PROFILE_QUERY_KEY = ['profile'];

interface UseProfileResult {
  profile: Profile | null | undefined;
  isLoadingProfile: boolean;
  profileError: Error | null;
  isUpdatingProfile: boolean;
  updateProfileError: Error | null;
  updateProfile: UseMutationResult<Profile | null, Error, Profile>['mutate'];
  refetchProfile: UseQueryResult<Profile | null, Error>['refetch'];
}

export const useProfile = (): UseProfileResult => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get user from auth context to enable/disable query

  // Fetch profile data
  const { 
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile 
  }: UseQueryResult<Profile | null, Error> = useQuery(
    {
      queryKey: PROFILE_QUERY_KEY,
      queryFn: getProfile, 
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // Renamed from cacheTime (Garbage Collection time)
      enabled: !!user, // Only run the query if the user is logged in
    }
  );

  // Update profile data
  const { 
    mutate: updateProfileMutation,
    isPending: isUpdatingProfile,
    error: updateProfileError
  }: UseMutationResult<Profile | null, Error, Profile> = useMutation<Profile | null, Error, Profile>(
    {
      mutationFn: updateProfile, // The mutation function
      onSuccess: (updatedProfile: Profile | null) => {
        // Invalidate and refetch the profile query to get fresh data
        queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
        // Optionally, you can directly update the cache
        if (updatedProfile) {
          queryClient.setQueryData(PROFILE_QUERY_KEY, updatedProfile);
        }
      },
      onError: (error: Error) => {
        console.error('Failed to update profile:', error);
        // Handle error appropriately (e.g., show a notification)
      },
    }
  );

  return {
    profile,
    isLoadingProfile,
    profileError: profileError || null, // Ensure error is explicitly null if no error
    isUpdatingProfile,
    updateProfileError: updateProfileError || null, // Ensure error is explicitly null if no error
    updateProfile: updateProfileMutation,
    refetchProfile,
  };
}; 