import React, { useCallback, useEffect, useState } from 'react';
import Form from 'components/Form';
import CompensationField from 'components/CompensationField';
import ActionButton from 'components/Form/ActionButton';
import { gql, useMutation } from '@apollo/client';
import { useUser } from 'contexts/User';

interface MediatorCompensationState {
  minCompensation: number;
}

const SetMinCompensation = gql`
  mutation SetMinCompensation($pkh: String!, $minCompensation: Int!) {
    SetMinCompensation(pkh: $pkh, minCompensation: $minCompensation) {
      name
      minCompensation
    }
  }
`;

function MediatorCompensation(): JSX.Element {
  const { name, ownPKH } = useUser();
  const [values, setValues] = useState<MediatorCompensationState>({ minCompensation: 10 });
  const handleChange = (value: number) => {
    setValues({ minCompensation: value });
  };
  const [mutateFunction, { data, loading, error }] = useMutation(SetMinCompensation, { fetchPolicy: 'no-cache' });

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  useEffect(() => {
    if (data?.SetMinCompensation) {
    }
  }, [data]);

  const handleSubmit = useCallback(
    async (evt: React.MouseEvent) => {
      evt.preventDefault();
      await mutateFunction({ variables: { ...values, pkh: ownPKH } });
    },
    [values],
  );
  return (
    <div>
      <h1 className="page-title">Hi {name}! Please set your minimum compensation in ADA</h1>
      <Form>
        <CompensationField handleChange={handleChange} value={values.minCompensation} />
        <ActionButton handleClick={handleSubmit} type="Set minimum compensation" loading={loading} />
      </Form>
    </div>
  );
}

export default MediatorCompensation;
