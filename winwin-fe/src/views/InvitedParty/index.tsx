import React from 'react';
import winwin from 'assets/light-win-win.png';
import Confetti from 'react-confetti';
export default function InvitedParty(): JSX.Element {
  return (
    <div>
      <h1 className="page-title">Thank you for inviting a party to our growing platform for high quality mediation</h1>
      <div className="mx-auto w-9/12 flex flex-col items-center">
        <Confetti />
        <img src={winwin} className="w-96" alt="win win hands shaking" />
      </div>
    </div>
  );
}
