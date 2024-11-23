export interface User {
  id: string;
  email: string;
  displayName: string | null;
  phoneNumber: string | null;
  role: 'admin' | 'technician' | 'user';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}