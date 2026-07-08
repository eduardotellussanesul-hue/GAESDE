import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthSession, LoginInput } from '../../domain/entities/auth';
import type { User } from '../../domain/entities/user';
import { tokenStorage } from '../../core/storage/tokenStorage';
import { AuthApiRepository } from '../../infrastructure/api/repositories/authApiRepository';
import { LoginUseCase } from '../../application/use-cases/auth/loginUseCase';
import { RestoreSessionUseCase } from '../../application/use-cases/auth/restoreSessionUseCase';
import { getErrorMessage } from '../utils/errorMessage';
import { AuthContext } from './auth-context';

const authRepository = new AuthApiRepository();
const loginUseCase = new LoginUseCase(authRepository);
const restoreSessionUseCase = new RestoreSessionUseCase(authRepository);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const token = tokenStorage.get();
      if (!token) {
        if (mounted) {
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const restored = await restoreSessionUseCase.execute(token);
        if (mounted) {
          setSession(restored);
        }
      } catch {
        tokenStorage.clear();
        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (input: LoginInput) => {
    try {
      const authSession = await loginUseCase.execute(input);
      tokenStorage.set(authSession.accessToken);
      setSession(authSession);
    } catch (error) {
      throw new Error(getErrorMessage(error), { cause: error });
    }
  }, []);

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setSession(null);
  }, []);

  const updateSessionUser = useCallback((user: User) => {
    setSession((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        user,
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      session,
      isBootstrapping,
      signIn,
      signOut,
      updateSessionUser,
    }),
    [session, isBootstrapping, signIn, signOut, updateSessionUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
