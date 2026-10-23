import {
  AuthDatasource,
  LoginPayload,
  RegisterPayload,
} from "../../domain/datasources/auth.datasource";
import { AuthResponse } from "../../domain/entities/user.entity";
import { AuthRepository } from "../../domain/repositories/auth.repository";
import { AuthDatasourceImpl } from "../datasources/auth.datasource.impl";

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly datasource: AuthDatasource) {}

  login(payload: LoginPayload): Promise<AuthResponse> {
    return this.datasource.login(payload);
  }

  register(payload: RegisterPayload): Promise<AuthResponse> {
    return this.datasource.register(payload);
  }
}

const authDatasource = new AuthDatasourceImpl();
export const authRepository = new AuthRepositoryImpl(authDatasource);
