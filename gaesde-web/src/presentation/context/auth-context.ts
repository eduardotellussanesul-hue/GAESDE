import { createContext } from 'react';
import type { AuthSession, LoginInput } from '../../domain/entities/auth';
import type { User } from '../../domain/entities/user';

export type AuthContextValue = {
  session: AuthSession | null;
  isBootstrapping: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  signOut: () => void;
  updateSessionUser: (user: User) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);