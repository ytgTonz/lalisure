
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { StaffUser } from '@/lib/auth/staff-auth';

const fetchStaffUser = async () => {
  try {
    const response = await axios.get<{ user: StaffUser }>('/api/staff/me');
    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

export const useStaffUser = () => {
  return useQuery<StaffUser | null>({
    queryKey: ['staff-user'],
    queryFn: fetchStaffUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
