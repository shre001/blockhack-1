import React, { useState } from 'react';
import { UserContext, UserContextState, UserProviderProps, SelectUserProps } from 'contexts/User';

export default function UserProvider({ children }: UserProviderProps): JSX.Element {
  const [value, setValue] = useState<UserContextState>({ name: '', ownPKH: '', ownWID: '', isMediator: false, userId: '', email: '' });
  const selectUser = ({ ownPKH, ownWID, name, isMediator, userId, email }: SelectUserProps) => {
    // ownPubKeyHash
    // ownWalletId
    setValue({ name, ownWID, ownPKH, isMediator, userId, email });
  };
  return <UserContext.Provider value={{ ...value, selectUser }}>{children}</UserContext.Provider>;
}
