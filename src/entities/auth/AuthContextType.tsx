import { User } from 'entities';

export default interface AuthContextType {
  loading: boolean;
  user: User;
}