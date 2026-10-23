import { queryClient } from "@/core/query/query-client";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { UserEntity } from "../../domain/entities/user.entity";

const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

type AuthContextType = {
  user: UserEntity | null;
  loaded: boolean;
  setUser: (user: UserEntity | null) => void;
  setSession: (token: string, user: UserEntity) => Promise<void>;
  signOut: () => Promise<void>;
  checkLogued: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loaded: false,
  setUser: () => {},
  setSession: async () => {},
  signOut: async () => {},
  checkLogued: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserEntity | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Al abrir la app, verifica si hay un token y usuario guardados
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const userJson = await SecureStore.getItemAsync(USER_KEY);

        if (token && userJson) {
          const parsedUser = JSON.parse(userJson) as UserEntity;
          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error cargando sesión:", error);
        setUser(null);
      } finally {
        setLoaded(true);
      }
    };

    loadUser();
  }, []);

  // Guarda token + usuario en SecureStore y actualiza el estado global
  const setSession = async (token: string, userData: UserEntity) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  // Cierra sesión limpiando SecureStore, el estado y la caché de TanStack Query
  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      setUser(null);
      queryClient.clear(); // Limpia datos en caché de citas/expedientes del usuario anterior
      router.replace("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Verifica si el token sigue existiendo en el almacenamiento seguro
  const checkLogued = async (): Promise<boolean> => {
    const currentToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!currentToken) {
      setUser(null);
      return false;
    }
    return !!user;
  };

  return (
    <AuthContext.Provider
      value={{ user, loaded, setUser, setSession, signOut, checkLogued }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
