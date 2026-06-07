import { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfile {
  uid: string;
  name: string;
  email: string | null;
  phone: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<UserProfile>({
    uid: 'local',
    name: 'Farmer',
    email: null,
    phone: null,
    photoURL: null,
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: false,
        isAuthenticated: true,
        refreshUser: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
