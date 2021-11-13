import React from 'react';
import { Route, Switch } from 'react-router-dom';
import MediatorSignUp from 'views/MediatorSignUp';
import PartySignUp from 'views/PartySignUp';
import SignUpPage from 'views/SignUpPage';
import Header from './components/Header';
import MediatorScheduler from 'views/MediatorScheduler';
import PartyScheduler from 'views/PartyScheduler';
import PartyFinder from 'views/PartyFinder';
import MediatorCompensation from 'views/MediatorCompensation';
import PartyPayMediator from 'views/PartyPayMediator';
import AcceptDeny from 'views/AcceptDeny';
import InviteParty from 'views/InviteParty';
import InvitedParty from 'views/InvitedParty';
import AllPaid from 'views/AllPaid';
function Routes(): JSX.Element {
  return (
    <>
      <Route path="/">
        <Header />
      </Route>
      <Switch>
        <Route exact path="/signup">
          <SignUpPage />
        </Route>
        <Route exact path="/signup/mediator-signup">
          <MediatorSignUp />
        </Route>
        {/* Add Route for MediatorScheduler */}
        <Route exact path="/signup/party-signup">
          <PartySignUp />
        </Route>
        <Route exact path="/mediator-compensation">
          <MediatorCompensation />
        </Route>
        <Route exact path="/mediator-schedule">
          <MediatorScheduler />
        </Route>
        <Route exact path="/party-select-schedule">
          <PartyScheduler />
        </Route>
        <Route exact path="/invite-to-mediation">
          <InviteParty />
        </Route>
        <Route exact path="/invited-party">
          <InvitedParty />
        </Route>
        <Route exact path="/all-parties-paid">
          <AllPaid />
        </Route>
        <Route exact path="/party-payment">
          <PartyPayMediator />
        </Route>
        <Route exact path="/party-finder">
          <PartyFinder />
        </Route>
        <Route exact path="/accept-deny-mediation/:caseId/:email">
          <AcceptDeny />
        </Route>
      </Switch>
    </>
  );
}

export default Routes;
