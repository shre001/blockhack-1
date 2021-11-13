import React from 'react';
interface PubKeyHashFieldProps {
  value: string;
  handleChange: (name: string, value: string) => void;
}
function PubKeyHashField({ value, handleChange }: PubKeyHashFieldProps): JSX.Element {
  return (
    <div className="form-group">
      <label className="form-label">Public Key Hash</label>
      <input
        type="text"
        className="form-input"
        placeholder="Public Key Hash"
        onChange={(evt) => {
          handleChange('pkh', evt.currentTarget.value);
        }}
        value={value}
      />
    </div>
  );
}

export default PubKeyHashField;
