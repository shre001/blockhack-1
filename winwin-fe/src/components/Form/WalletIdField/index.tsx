import React from 'react';
interface WalletIdFieldProps {
  value: string;
  handleChange: (name: string, value: string) => void;
}
function WalletIdField({ value, handleChange }: WalletIdFieldProps): JSX.Element {
  return (
    <div className="form-group">
      <label className="form-label">Wallet Id</label>
      <input
        type="text"
        className="form-input"
        placeholder="Wallet Id"
        onChange={(evt) => {
          handleChange('wid', evt.currentTarget.value);
        }}
        value={value}
      />
    </div>
  );
}

export default WalletIdField;
