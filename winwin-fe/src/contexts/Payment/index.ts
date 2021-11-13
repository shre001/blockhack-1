import { useContext, createContext } from 'react';

export interface PaymentProviderProps {
  children: React.ReactNode;
}

export interface MediatorSelectionProps {
  mediatorPKH: string;
  minCompensation: number;
  mName: string;
}
export interface PaymentContextState {
  mediatorPKH: string;
  minCompensation: number;
  mName: string;
  selectMediator?: ({ mediatorPKH, minCompensation, mName }: MediatorSelectionProps) => void;
  payToMediator?: () => Promise<boolean>;
}
export const PaymentContext = createContext<PaymentContextState>({ mediatorPKH: '', mName: '', minCompensation: 10 });

export function usePayment(): PaymentContextState {
  return useContext(PaymentContext);
}
