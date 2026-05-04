import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { login, register, fetchCurrentUser } from '../api/auth';
import type { LoginParams, RegisterParams, AuthResponse } from '../api/auth';
import { setAuthToken } from '../api/client';

export const authKeys = {
  user: ['auth', 'user'] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: fetchCurrentUser,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: LoginParams) => login(params),
    onSuccess: (data: AuthResponse) => {
      setAuthToken(data.token);
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RegisterParams) => register(params),
    onSuccess: (data: AuthResponse) => {
      setAuthToken(data.token);
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      setAuthToken(null);
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
