import React, { useCallback, useState } from 'react';
import { PaymentContext, PaymentContextState, PaymentProviderProps, MediatorSelectionProps } from 'contexts/Payment';
import { useUser } from 'contexts/User';
import { gql, useMutation } from '@apollo/client';
import { useCase } from 'contexts/Case';

const PayToMediator = gql`
  mutation PayToMediator($mediatorPKH: String!, $partyPKH: String!, $caseId: ID!) {
    PayToMediator(mediatorPKH: $mediatorPKH, partyPKH: $partyPKH, caseId: $caseId)
  }
`;

export default function PaymentProvider({ children }: PaymentProviderProps): JSX.Element {
  const { ownPKH } = useUser();
  const { caseId, mediator } = useCase();
  const [payMutation] = useMutation(PayToMediator, { fetchPolicy: 'network-only' });
  const [values, setValues] = useState<PaymentContextState>({ mName: '', mediatorPKH: '', minCompensation: 10 });
  const selectMediator = async ({ mediatorPKH, minCompensation, mName }: MediatorSelectionProps) => {
    setValues({ mediatorPKH, mName, minCompensation });
  };
  const payToMediator = useCallback(async (): Promise<boolean> => {
    console.log('%cindex.tsx line:22 values', 'color: #007acc;', values);
    const { data } = await payMutation({ variables: { mediatorPKH: mediator?.pkh, partyPKH: ownPKH, caseId } });
    console.log('%cindex (Payment).tsx line:23 data', 'color: #007acc;', data);
    if (data?.PayToMediator === false) {
      // failed Payment
      return false;
    } else {
      return true;
    }
    return data.Pay;
  }, [ownPKH, payMutation, caseId, mediator, values]);
  return <PaymentContext.Provider value={{ ...values, payToMediator, selectMediator }}>{children}</PaymentContext.Provider>;
}
