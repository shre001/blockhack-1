import React, { useCallback, useEffect, useState } from 'react';
import Form from 'components/Form';
import ActionButton from 'components/Form/ActionButton';
import EmailField from 'components/Form/EmailField';
import { gql, useMutation } from '@apollo/client';
import { useCase } from 'contexts/Case';
import { useUser } from 'contexts/User';
import { usePayment } from 'contexts/Payment';
import { useHistory } from 'react-router';
export interface InvitePartyState {
  [key: string]: string;
  email: string;
}

export const InviteToMediation = gql`
  mutation InviteToMediation($mediatorPKH: String!, $partyPKH: String!, $otherPartyEmail: String!, $startDate: String!) {
    InviteToMediation(mediatorPKH: $mediatorPKH, partyPKH: $partyPKH, otherPartyEmail: $otherPartyEmail, startDate: $startDate)
  }
`;

export default function InviteParty(): JSX.Element {
  const { caseId, mediator, on, selectCase } = useCase();
  const { selectMediator } = usePayment();
  const { ownPKH } = useUser();
  const history = useHistory();
  const [values, setValues] = useState<InvitePartyState>({ email: '' });
  const [inviteMutation, { data }] = useMutation(InviteToMediation, { fetchPolicy: 'network-only' });
  const handleChange = (name: string, value: string) => {
    setValues((values) => ({ ...values, [name]: value }));
  };
  useEffect(() => {
    if (data?.InviteToMediation) {
      selectCase?.({ caseId: '', parties: [], mediator: undefined });
      selectMediator?.({ mediatorPKH: '', minCompensation: 0, mName: '' });
      history.push('/invited-party');
    } else {
      console.error(data, 'SOMETHING WENT WRONG');
    }
  }, [data]);
  const handleSubmit = useCallback(
    (evt: React.MouseEvent) => {
      evt.preventDefault();
      inviteMutation({
        variables: { mediatorPKH: mediator?.pkh, partyPKH: ownPKH, otherPartyEmail: values.email, startDate: on?.formatted },
      });
    },
    [values, inviteMutation, caseId, mediator, on],
  );
  return (
    <div>
      <h1 className="page-title">Invite the other party to the selected mediation</h1>

      <Form>
        <EmailField handleChange={handleChange} value={values.email} />
        <ActionButton handleClick={handleSubmit} loading={false} type="Invite Party to Mediation" />
      </Form>
    </div>
  );
}
