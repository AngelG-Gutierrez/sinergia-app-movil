import { AuthResponse } from "../entities/user.entity";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthRepository {
  register(payload: RegisterPayload): Promise<AuthResponse>;
  login(payload: LoginPayload): Promise<AuthResponse>;
}
