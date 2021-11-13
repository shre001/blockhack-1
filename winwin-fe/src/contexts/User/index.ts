import { useContext, createContext } from 'react';

export interface UserProviderProps {
  children: React.ReactNode;
}
export interface SelectUserProps {
  ownPKH: string;
  ownWID: string;
  name: string;
  userId: string;
  email: string;
  isMediator: boolean;
}
export interface UserContextState {
  isMediator: boolean;
  ownPKH: string;
  ownWID: string;
  name: string;
  userId: string;
  email: string;
  selectUser?: ({ ownPKH, ownWID, isMediator, name, userId }: SelectUserProps) => void;
}
export const UserContext = createContext<UserContextState>({ isMediator: false, ownPKH: '', ownWID: '', name: '', userId: '', email: '' });

export function useUser(): UserContextState {
  return useContext(UserContext);
}
