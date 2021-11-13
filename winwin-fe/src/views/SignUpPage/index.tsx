import React from 'react';
import { NavLink } from 'react-router-dom';

const SignUpPage = (): JSX.Element => {
  return (
    <div className="grid justify-center gap-2">
      <NavLink to="/signup/mediator-signup" className="signup-btn">
        I provide mediation
      </NavLink>
      <NavLink to="/signup/party-signUp" className="signup-btn">
        I seek mediation
      </NavLink>
    </div>
  );
};
export default SignUpPage;
