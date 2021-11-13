import React from 'react';
import { ReactComponent as Spinner } from 'assets/spinner.svg';
import './buttons.css';
interface ActionButtonProps {
  handleClick: (evt: React.MouseEvent) => void;
  type: string;
  loading: boolean;
  disabled?: boolean;
  className?: string;
}

function ActionButton({ handleClick, type, loading, className, disabled }: ActionButtonProps): JSX.Element {
  return (
    <button
      className={`${className === 'button-deny' ? 'button-deny' : 'button-create'} ${disabled ? 'button-disabled' : 'button-active'}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {loading && <Spinner className="animate-spin h-5 w-5 ml-5 text-white self-center" />}
      {!loading && type}
    </button>
  );
}

export default ActionButton;
