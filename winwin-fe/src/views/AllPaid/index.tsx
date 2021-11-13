import React from 'react';
import winwinli from 'assets/li-winwin.png';
export default function AllPaid(): JSX.Element {
  return (
    <div className="page">
      <h1 className="page-title">Now that everyone has signed up you can expect these things from us:</h1>
      <div className="flex-row flex mb-4">
        <div className="w-6 h-6 p-0 mr-4 mt-1">
          <img src={winwinli} className="w-4 h-4" />
        </div>
        <div className="w-full">
          An email with a confirmation that all parties have signed up and detailed information on your rights and responsibilities during
          mediation.
        </div>
      </div>
      <div className="flex-row flex mb-4">
        <div className="w-6 h-6 p-0 mr-4 mt-1">
          <img src={winwinli} className="w-4 h-4" />
        </div>
        <div className="w-full">Info material to prepare you for optimal outcomes for your mediation.</div>
      </div>
      <div className="flex-row flex mb-4">
        <div className="w-6 h-6 p-0 mr-4 mt-1">
          <img src={winwinli} className="w-4 h-4" />
        </div>
        <div className="w-full">Meeting details and reminders leading up to your mediation.</div>
      </div>
    </div>
  );
}
