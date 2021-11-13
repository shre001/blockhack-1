import React from 'react';
interface EmailFieldProps {
  value: string;
  handleChange: (name: string, value: string) => void;
}

function EmailField({ value, handleChange }: EmailFieldProps): JSX.Element {
  return (
    <div className="form-group">
      <label className="form-label">Email</label>
      <input
        type="email"
        className="form-input"
        placeholder="Email"
        onChange={(evt) => {
          handleChange('email', evt.currentTarget.value);
        }}
        value={value}
      />
    </div>
  );
}

export default EmailField;
