import { createContext, useContext, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth, SignOutButton } from '@clerk/clerk-react';

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
  signOutComponent: React.FC<{ children?: ReactNode }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refreshUser: async () => {},
  signOutComponent: SignOutButton,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useClerkAuth();

  const isLoading = !userLoaded;
  const isAuthenticated = !!isSignedIn;

  const user: UserProfile | null = clerkUser
    ? {
        uid: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || 'Farmer',
        email: clerkUser.primaryEmailAddress?.emailAddress || null,
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || null,
        photoURL: clerkUser.imageUrl || null,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        refreshUser: async () => {},
        signOutComponent: SignOutButton,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
