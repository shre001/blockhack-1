import React, { useCallback, useEffect, useState } from 'react';
import ActionButton from 'components/Form/ActionButton';
import { gql, useMutation } from '@apollo/client';
import Scheduler from 'components/Scheduler';
import Form from 'components/Form';
import { useUser } from 'contexts/User';
import { useHistory } from 'react-router';

interface MediatorSchedulerState {
  dates: string[];
}

const AddAvailability = gql`
  mutation AddAvailability($pkh: String!, $dates: [String!]) {
    AddAvailability(pkh: $pkh, dates: $dates) {
      mediators {
        name
      }
    }
  }
`;

function MediatorScheduler(): JSX.Element {
  const history = useHistory();
  const { ownPKH, name, isMediator } = useUser();
  const [values, setValues] = useState<MediatorSchedulerState>({ dates: [] });
  const handleChange = (name: string, value: string[]) => {
    setValues((values) => ({ ...values, [name]: value }));
  };
  const [mutateFunction, { data, loading, error }] = useMutation(AddAvailability, { fetchPolicy: 'no-cache' });

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  useEffect(() => {
    console.log('%cindex.tsx line:31 data', 'color: #007acc;', data);
  }, [data]);

  const handleSubmit = useCallback(
    async (evt: React.MouseEvent) => {
      evt.preventDefault();
      if (isMediator && ownPKH) {
        await mutateFunction({ variables: { ...values, pkh: ownPKH } });
        history.push('/mediator-compensation');
      }
    },
    [values],
  );
  return (
    <div>
      <h1 className="page-title">Hi {name}, please select your upcoming schedule availability</h1>
      <Form>
        <Scheduler handleChange={handleChange} />
        <ActionButton handleClick={handleSubmit} type="Schedule" loading={loading} />
      </Form>
    </div>
  );
}

export default MediatorScheduler;
