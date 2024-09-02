import { User } from 'entities';

export default interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, callback: () => void) => Promise<void>;
  logout: () => Promise<void>;
}