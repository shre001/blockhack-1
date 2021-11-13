import { useContext, createContext } from 'react';

export interface CaseProviderProps {
  children: React.ReactNode;
}
import { Party } from 'views/PartyFinder';
import { Mediator } from 'views/PartyScheduler';
export interface CaseSelectionProps {
  caseId: string;
  parties: Party[];
  mediator?: Mediator;
  on?: { formatted: string };
}
export interface CaseContextState {
  caseId: string;
  parties: Party[];
  mediator?: Mediator;
  on?: { formatted: string };
  selectCase?: ({ caseId, parties, mediator }: CaseSelectionProps) => void;
}
export const CaseContext = createContext<CaseContextState>({ caseId: '', parties: [] });

export function useCase(): CaseContextState {
  return useContext(CaseContext);
}
