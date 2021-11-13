import ActionButton from 'components/Form/ActionButton';
import { usePayment } from 'contexts/Payment';
import { useUser } from 'contexts/User';
import React, { useEffect, useState, useCallback } from 'react';
import cardano from 'assets/cardano.png';
import { useHistory } from 'react-router';
import { useLazyQuery, gql } from '@apollo/client';
import { useCase } from 'contexts/Case';

export const GET_N_PAID = gql`
  query GET_N_PAID($caseId: ID!) {
    Case(caseId: $caseId) {
      paidPartiesN
    }
  }
`;

export default function PartyPayMediator(): JSX.Element {
  const { mediatorPKH, minCompensation, mName } = usePayment();
  console.log('%cindex.tsx line:9 mediatorPKH', 'color: #007acc;', mediatorPKH);
  const history = useHistory();
  const { payToMediator } = usePayment();
  const { caseId } = useCase();
  const { name } = useUser();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [fetchPaid, { data: paidData, loading: paidLoading }] = useLazyQuery(GET_N_PAID, { fetchPolicy: 'cache-and-network' });
  useEffect(() => {
    if (paidData?.Case?.length) {
      if (paidData.Case[0].paidPartiesN === 1) {
        history.push('/invite-to-mediation');
      } else {
        history.push('/all-parties-paid');
      }
    }
  }, [paidData]);
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    const success = await payToMediator?.();
    if (success) {
      fetchPaid({ variables: { caseId } });
    }
  }, [caseId]);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
        setCompleted(true);
      }, 1500);
    }
  }, [loading]);
  useEffect(() => {
    if (completed) {
      setTimeout(() => {
        setCompleted(false);
        setConfirmed(true);
      }, 2000);
    }
  }, [completed]);

  return (
    <div className="page">
      <h1 className="page-title">Hi {name}! Please click submit to move forward with the contract</h1>
      {confirmed && (
        <div>
          <div className="my-20 loading text-center">Transaction confirmed.</div>
        </div>
      )}
      {completed && !confirmed && (
        <div>
          <div className="my-20 loading text-center">Contract instance created. Waiting for confirmation of transaction.</div>
        </div>
      )}
      {loading && !completed && (
        <div>
          <div className="loading w-32 my-20 items-center flex-row align-center justify-center">
            <img src={cardano} className="w-full animate-ping" />
          </div>
          <div className="my-20 loading text-center">
            Communicating with PAB to initate contract instance <span className="animate-ping">...</span>
          </div>
        </div>
      )}
      {!loading && !completed && !confirmed && (
        <div className="max-w-md mx-auto my-20 w-full flex flex-col items-center">
          <ActionButton
            type={`Pay ${minCompensation}ADA to the contract for mediation with ${mName}`}
            handleClick={handleSubmit}
            loading={loading || paidLoading}
          />
        </div>
      )}
    </div>
  );
}
