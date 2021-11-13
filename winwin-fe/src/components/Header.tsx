import { useCase } from 'contexts/Case';
import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const Header = (): JSX.Element => {
  const { selectCase } = useCase();
  return (
    <header className="w-full mb-8 h-14 p-2.5 bg-gray-400 grid grid-flow-col auto-cols-max gap-x-5 justify-items-end justify-end">
      <NavLink to="/">Home</NavLink>
      <NavLink to="/signup">Sign Up</NavLink>
      <NavLink
        to="/party-finder"
        onClick={() => {
          selectCase?.({ caseId: '', parties: [], mediator: undefined });
        }}
      >
        Party Finder
      </NavLink>
    </header>
  );
};
export default Header;
