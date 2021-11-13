import React, { useEffect, useState, useCallback } from 'react';
import Form from 'components/Form';
import ActionButton from 'components/Form/ActionButton';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useUser } from 'contexts/User';
import moment from 'moment';
import { usePayment } from 'contexts/Payment';
import { useHistory } from 'react-router';
import { useCase } from 'contexts/Case';

// interface PartySchedulerState {
//   dates: string[];
//   name: string;
//   pkh: string;
// }

const TakeAvailability = gql`
  mutation TakeAvailability($mediatorPKH: String!, $partyPKH: String!, $date: String!) {
    TakeAvailability(mediatorPKH: $mediatorPKH, partyPKH: $partyPKH, availability: $date) {
      caseId
      parties {
        pkh
        name
      }
      mediator {
        pkh
        name
        minCompensation
      }
      on {
        formatted
      }
    }
  }
`;

const ShowAvailability = gql`
  query ShowAvailability {
    Availability(orderBy: on_asc) {
      mediators {
        name
        pkh
        minCompensation
      }
      on {
        formatted
      }
    }
  }
`;
export type Mediator = {
  __typename: string;
  name: string;
  pkh: string;
  minCompensation: number;
};
type AvailabilityType = {
  __typename: string;
  mediators: Mediator[];
  on: { formatted: string };
};
type NewAvailabilityType = {
  mediators: Mediator[];
  on: moment.Moment;
  originalOn: string;
};
function PartyScheduler(): JSX.Element {
  const { selectMediator } = usePayment();
  const { selectCase } = useCase();
  const { ownPKH, name } = useUser();
  const { caseId } = useCase();
  const history = useHistory();
  const { data, error, loading, refetch } = useQuery(ShowAvailability, { fetchPolicy: 'no-cache' });
  const [takeMutation, { error: errorM, loading: loadingM }] = useMutation(TakeAvailability, {
    fetchPolicy: 'no-cache',
    onCompleted: () => {
      refetch();
      history.push('/party-payment');
    },
  });
  const [openAvailabilities, setOpenAvailabilities] = useState<NewAvailabilityType[]>([]);
  useEffect(() => {
    if (caseId) {
      history.push('/party-payment');
    }
  }, [caseId]);
  useEffect(() => {
    if (data?.Availability) {
      setOpenAvailabilities(
        data.Availability?.map((av: AvailabilityType) => {
          const date = moment.utc(av.on.formatted);
          const retAvailability = {
            on: date,
            originalOn: av.on.formatted,
            mediators: av.mediators.map((m: Mediator) => ({ name: m.name, pkh: m.pkh, minCompensation: m.minCompensation })),
          } as NewAvailabilityType;
          return retAvailability;
        }),
      );
    }
  }, [data]);

  if (error || errorM) {
    return <div>{JSON.stringify(error || errorM)}</div>;
  }
  const handleSubmit = useCallback(
    async (mPKH: string, dateString: string, minCompensation: number, name: string) => {
      const { data: caseInfo } = await takeMutation({ variables: { mediatorPKH: mPKH, partyPKH: ownPKH, date: dateString } });
      selectCase?.(caseInfo.TakeAvailability);
      console.log('%cindex.tsx line:110 {mPKH, minCompensation,name}', 'color: #007acc;', { mPKH, minCompensation, name });
      selectMediator?.({ mediatorPKH: mPKH, minCompensation, mName: name });
    },
    [ownPKH],
  );

  return (
    <div>
      <h1 className="page-title">Hi {name}! Choose a date and mediator that suits your needs</h1>
      <Form>
        {openAvailabilities.map((av: NewAvailabilityType) => {
          if (av.on.isBefore(moment.utc().subtract(2, 'day')) || av.mediators.length == 0) {
            return <div key={`${av.on.valueOf()}-${av.mediators.map((m) => m.pkh).join('-')}-past`}></div>;
          }
          return (
            <div key={av.on.valueOf()}>
              {av.on.utc().format('MMMM Do YYYY')}
              {av.mediators.map((m: Mediator) => (
                <ActionButton
                  key={`${av.on.utc().valueOf()}-${m.name}`}
                  handleClick={(e) => {
                    e.preventDefault();
                    handleSubmit(m.pkh, av.originalOn, m.minCompensation, m.name);
                  }}
                  type={`Select mediator ${m.name}`}
                  loading={loading || loadingM}
                />
              ))}
            </div>
          );
        })}
      </Form>
    </div>
  );
}

export default PartyScheduler;
