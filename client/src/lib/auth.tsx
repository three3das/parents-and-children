import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
 
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  newsletter: boolean;
  createdAt: string;
  hasSubscription?: boolean;
}
 
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}
 
const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    const storedUser = localStorage.getItem('knowledgechildren-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('knowledgechildren-user');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);
 
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('knowledgechildren-user', JSON.stringify(userData));
  };
 
  const logout = () => {
    setUser(null);
    localStorage.removeItem('knowledgechildren-user');
  };
 
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
 
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}