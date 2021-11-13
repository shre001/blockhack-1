import { gql, useQuery } from '@apollo/client';
import { useUser } from 'contexts/User';
import React from 'react';
import { useHistory } from 'react-router';

const GetParties = gql`
  query GetParties {
    Party {
      name
      pkh
      userId
      wid
      email
    }
  }
`;
export type Party = {
  name: string;
  pkh: string;
  userId: string;
  wid: string;
  email: string;
};
export default function PartyFinder(): JSX.Element {
  const { selectUser } = useUser();
  const history = useHistory();
  const { data } = useQuery(GetParties, { fetchPolicy: 'cache-and-network' });
  const s = (pkh: string, wid: string, name: string, userId: string, email: string) => {
    selectUser?.({ ownPKH: pkh, ownWID: wid, isMediator: false, name, userId, email });
    history.push('/party-select-schedule');
  };
  return (
    <div className="container mx-auto max-w-4xl">
      {data?.Party?.map((gp: Party) => {
        return (
          <div key={gp.pkh}>
            <button
              className="rounded text-center py-2 px-2 bg-green-400 m-2 w-full"
              onClick={() => {
                s(gp.pkh, gp.wid, gp.name, gp.userId, gp.email);
              }}
            >
              {gp.name}
            </button>
          </div>
        );
      })}
    </div>
  );
}
