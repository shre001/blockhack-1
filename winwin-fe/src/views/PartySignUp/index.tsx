import React, { useState, useCallback, useEffect } from 'react';
import NameField from 'components/Form/NameField';
import Form from 'components/Form';
import PubKeyHashField from 'components/Form/PubKeyHashField';
import EmailField from 'components/Form/EmailField';
import ActionButton from 'components/Form/ActionButton';
import { gql, useMutation } from '@apollo/client';
import WalletIdField from 'components/Form/WalletIdField';
import { useUser } from 'contexts/User';
import { useCase } from 'contexts/Case';
import { usePayment } from 'contexts/Payment';
import { useHistory } from 'react-router';
interface PartyFormState {
  [key: string]: string;
  name: string;
  pkh: string;
  email: string;
  wid: string;
}

const CreateParty = gql`
  mutation CreateParty($name: String!, $pkh: String!, $wid: String!, $email: String!) {
    CreateParty(name: $name, pkh: $pkh, wid: $wid, email: $email) {
      name
      pkh
      wid
      email
      userId
    }
  }
`;

function PartySignUp(): JSX.Element {
  const [values, setValues] = useState<PartyFormState>({ name: '', pkh: '', wid: '', email: '' });
  const [mutateFunction, { loading }] = useMutation(CreateParty, { fetchPolicy: 'no-cache' });
  const { selectUser, email } = useUser();
  const { caseId } = useCase();
  const history = useHistory();
  const handleChange = (name: string, value: string) => {
    setValues((values) => ({ ...values, [name]: value }));
  };
  useEffect(() => {
    if (email) {
      setValues((values) => ({ ...values, email }));
    }
  }, [email]);
  const handleSubmit = useCallback(
    async (evt: React.MouseEvent) => {
      evt.preventDefault();
      const { data } = await mutateFunction({ variables: values });
      if (data?.CreateParty) {
        const { wid, pkh, name, email, userId } = data.CreateParty;
        selectUser?.({ ownWID: wid, ownPKH: pkh, email, name: name, isMediator: false, userId });
        if (caseId) {
          history.push('/party-payment');
        } else {
          history.push('/party-select-schedule');
        }
      }
    },
    [values, caseId, mutateFunction],
  );

  return (
    <div>
      <h1 className="page-title">This is the Party Sign Up Page</h1>
      <Form>
        <NameField value={values.name} handleChange={handleChange} />
        <PubKeyHashField value={values.pkh} handleChange={handleChange} />
        <WalletIdField value={values.wid} handleChange={handleChange} />
        <EmailField value={values.email} handleChange={handleChange} />
        <div className="w-full flex flex-col items-center">
          <ActionButton
            handleClick={handleSubmit}
            type="Create Party"
            loading={loading}
            disabled={!values.name || !values.pkh || !values.wid || !values.email}
          />
        </div>
      </Form>
    </div>
  );
}

export default PartySignUp;
