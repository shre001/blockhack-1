import React, { useCallback, useEffect, useState } from 'react';
import NameField from 'components/Form/NameField';
import Form from 'components/Form';
import PubKeyHashField from 'components/Form/PubKeyHashField';
import EmailField from 'components/Form/EmailField';
import ActionButton from 'components/Form/ActionButton';
import { gql, useMutation } from '@apollo/client';
import { useUser } from 'contexts/User';
import { useHistory } from 'react-router';
import WalletIdField from 'components/Form/WalletIdField';
import { useCase } from 'contexts/Case';
import { usePayment } from 'contexts/Payment';
interface MediatorFormState {
  [key: string]: string;
  name: string;
  pkh: string;
  email: string;
  wid: string;
}

const CreateMediator = gql`
  mutation CreateMediator($name: String!, $pkh: String!, $wid: String!, $email: String!) {
    CreateMediator(name: $name, pkh: $pkh, wid: $wid, email: $email) {
      name
      pkh
      wid
      email
      userId
    }
  }
`;

function MediatorSignUp(): JSX.Element {
  const { selectUser } = useUser();
  const { selectCase } = useCase();
  const { selectMediator } = usePayment();
  const history = useHistory();
  const [values, setValues] = useState<MediatorFormState>({ name: '', pkh: '', wid: '', email: '' });
  const handleChange = (name: string, value: string) => {
    setValues((values) => ({ ...values, [name]: value }));
  };
  const [mutateFunction, { data, loading, error }] = useMutation(CreateMediator, { fetchPolicy: 'no-cache' });

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  useEffect(() => {
    if (data?.CreateMediator) {
      const { pkh, wid, name, email, userId } = data.CreateMediator;
      selectMediator?.({ mediatorPKH: '', minCompensation: 0, mName: '' });
      selectCase?.({ caseId: '', parties: [], mediator: undefined });
      selectUser?.({ ownPKH: pkh, ownWID: wid, name, userId, email, isMediator: true });
      history.push('/mediator-schedule');
    }
  }, [data]);

  const handleSubmit = useCallback(
    async (evt: React.MouseEvent) => {
      evt.preventDefault();
      await mutateFunction({ variables: values });
    },
    [values],
  );
  return (
    <div>
      <h1 className="page-title">This is the Mediator Sign Up Page</h1>
      <Form>
        <NameField value={values.name} handleChange={handleChange} />
        <PubKeyHashField value={values.pkh} handleChange={handleChange} />
        <WalletIdField value={values.wid} handleChange={handleChange} />
        <EmailField value={values.email} handleChange={handleChange} />
        <div className="w-full flex flex-col items-center">
          <ActionButton
            handleClick={handleSubmit}
            type="Create Mediator"
            loading={loading}
            disabled={!values.name || !values.pkh || !values.wid || !values.email}
          />
        </div>
      </Form>
    </div>
  );
}

export default MediatorSignUp;
