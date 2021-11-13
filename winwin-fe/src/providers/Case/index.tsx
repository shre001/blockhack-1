import React, { useState } from 'react';
import { CaseContext, CaseContextState, CaseSelectionProps, CaseProviderProps } from 'contexts/Case';
// import { useUser } from 'contexts/User';
// import { gql, useMutation } from '@apollo/client';

export default function CaseProvider({ children }: CaseProviderProps): JSX.Element {
  // const { ownPKH } = useUser();
  const [values, setValues] = useState<CaseContextState>({ parties: [], caseId: '' });
  const selectCase = async ({ mediator, caseId, parties, on }: CaseSelectionProps) => {
    setValues({ mediator, caseId, parties, on });
  };
  return <CaseContext.Provider value={{ ...values, selectCase }}>{children}</CaseContext.Provider>;
}
