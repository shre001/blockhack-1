import React from 'react';
interface CompensationProps {
  value: number;
  handleChange: (value: number) => void;
}

function CompensationField({ value, handleChange }: CompensationProps): JSX.Element {
  return (
    <div className="form-group">
      <label className="form-label">Minimum Compensation</label>
      <input
        type="number"
        onChange={(e) => {
          handleChange(e.currentTarget.valueAsNumber);
        }}
        value={value}
        className="form-input"
        placeholder="ADA"
        min="10"
        step="5"
        pattern="[^.]"
      />
    </div>
  );
}

export default CompensationField;
