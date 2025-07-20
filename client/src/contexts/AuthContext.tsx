import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  type: 'doctor' | 'organization';
  specialty?: string;
  organization?: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: async () => {},
  isAuthenticated: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in (token exists)
    const checkAuthState = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Get current user data using the /me endpoint
          const userData = await authAPI.getCurrentUser();
          if (userData) {
            setUser({
              ...userData,
              name: userData.fullName // Add name for backward compatibility
            });
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    
    checkAuthState();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = await authAPI.login(email, password);
      if (userData) {
        setUser({
          ...userData,
          name: userData.fullName // Add name for backward compatibility
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
