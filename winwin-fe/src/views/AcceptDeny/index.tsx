import React, { useEffect, useState, MouseEvent } from 'react';
import { useHistory, useParams } from 'react-router';
import { gql, useQuery } from '@apollo/client';
import { useUser } from 'contexts/User';
import ActionButton from '../../components/Form/ActionButton';
import moment from 'moment';
import { Mediator } from 'views/PartyScheduler';
import { Party } from 'views/PartyFinder';
import { usePayment } from 'contexts/Payment';
import { useCase } from 'contexts/Case';

interface ParamTypes {
  caseId: string;
  email: string;
}

const GET_CASE_INFO = gql`
  query GET_CASE_INFO($caseId: ID) {
    Case(caseId: $caseId) {
      mediator {
        name
        minCompensation
        pkh
      }
      parties {
        name
      }
      on {
        formatted
      }
    }
  }
`;
export type Case = {
  caseId: string;
  parties: Party[];
  mediator: Mediator;
  on: { formatted: string };
};
function AcceptDeny(): JSX.Element {
  const history = useHistory();
  const { selectMediator } = usePayment();
  const params = useParams<ParamTypes>();
  const { caseId, email } = params;
  const [partyAName, setPartyAName] = useState('');
  const [mediatorName, setMediatorName] = useState('');
  const [mediationTime, setMediationTime] = useState('');

  const { data, loading } = useQuery(GET_CASE_INFO, { variables: { caseId } });

  const { selectCase } = useCase();
  useEffect(() => {
    if (data?.Case?.length && selectMediator && !mediationTime) {
      const caseInfo: Case = data.Case[0];
      setPartyAName(caseInfo.parties.map((p: Party) => p.name).join(', '));
      setMediatorName(caseInfo.mediator.name);
      const onDate = moment.utc(caseInfo.on.formatted);
      setMediationTime(onDate.format('LLL UTC'));
      selectMediator?.({
        mediatorPKH: caseInfo.mediator.pkh,
        minCompensation: caseInfo.mediator.minCompensation,
        mName: caseInfo.mediator.name,
      });
      selectCase?.({ caseId, parties: caseInfo.parties, mediator: caseInfo.mediator });
    }
  }, [data, selectMediator, caseId]);
  const accept = () => {
    history.push('/signup/party-signup');
  };
  return (
    <div className="page">
      <h1 className="page-title">Welcome {email}</h1>
      <div className="accept-deny">
        <h6 className="subtitle">
          {partyAName} has invited you to a mediation with {mediatorName} on {mediationTime}
        </h6>
        <div className="flex flex-col align-middle items-center">
          <ActionButton
            handleClick={(evt: MouseEvent) => {
              evt.preventDefault();
              accept();
            }}
            type="Accept Mediation"
            className="button-accept"
            loading={loading}
          />
          <ActionButton
            handleClick={(evt: MouseEvent) => {
              evt.preventDefault();
            }}
            type="Deny Mediation"
            className="button-deny"
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default AcceptDeny;
