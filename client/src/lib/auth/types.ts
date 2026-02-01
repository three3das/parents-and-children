export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  newsletter: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
