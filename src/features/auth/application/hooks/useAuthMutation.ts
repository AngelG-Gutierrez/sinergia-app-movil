import { useMutation } from "@tanstack/react-query";
import {
    LoginPayload,
    RegisterPayload,
} from "../../domain/datasources/auth.datasource";
import { authRepository } from "../../infraestructure/repositories/auth.repository.impl";
import { useAuth } from "../providers/authProvider";

export const useLoginMutation = () => {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authRepository.login(payload),
    onSuccess: async (data) => {
      await setSession(data.access_token, data.user);
    },
  });
};

export const useRegisterMutation = () => {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authRepository.register(payload),
    onSuccess: async (data) => {
      await setSession(data.access_token, data.user);
    },
  });
};
