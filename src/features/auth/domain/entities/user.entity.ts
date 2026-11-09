export interface UserEntity {
  id: string;
  name: string;
  email: string;
  role: "Paciente" | "Administrador";
  image?: string | null;
  birthDate: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserEntity;
}
