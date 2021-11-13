import React from 'react';
interface NameFieldProps {
  value: string;
  handleChange: (name: string, value: string) => void;
}
function NameField({ value, handleChange }: NameFieldProps): JSX.Element {
  return (
    <div className="form-group">
      <label className="form-label">Name</label>
      <input
        type="text"
        className="form-input"
        placeholder="Full name"
        onChange={(evt) => {
          handleChange('name', evt.currentTarget.value);
        }}
        value={value}
      />
    </div>
  );
}

export default NameField;
