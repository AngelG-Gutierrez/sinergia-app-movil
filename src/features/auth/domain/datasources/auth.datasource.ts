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

export abstract class AuthDatasource {
  abstract login(payload: LoginPayload): Promise<AuthResponse>;
  abstract register(payload: RegisterPayload): Promise<AuthResponse>;
}
