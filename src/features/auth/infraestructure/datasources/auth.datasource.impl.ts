import { httpClient } from "@/core/api/axios.adapter";
import {
  AuthDatasource,
  LoginPayload,
  RegisterPayload,
} from "../../domain/datasources/auth.datasource";
import { AuthResponse } from "../../domain/entities/user.entity";

export class AuthDatasourceImpl implements AuthDatasource {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return await httpClient.post<AuthResponse>("/auth/login", payload);
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return await httpClient.post<AuthResponse>("/auth/signup", payload);
  }
}
