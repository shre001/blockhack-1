import React, { useState } from 'react';
import moment from 'moment';
interface SchedulerProps {
  handleChange: (name: string, value: string[]) => void;
}

const Scheduler = ({ handleChange }: SchedulerProps): JSX.Element => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const minDate = moment(Date.now()).format('YYYY-MM-DD');
  const maxDate = moment(Date.now()).add(7, 'days').format('YYYY-MM-DD');

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedDates((oldArray) => {
      const newArray = Array.from(new Set<string>([...oldArray, e.target.value])).sort();
      handleChange('dates', newArray);
      return newArray;
    });
  };

  return (
    <>
      <input type="date" className="max-w-xs border" onChange={handleDateSelect} min={minDate} max={maxDate} />
      <p>Selected Dates: {JSON.stringify(selectedDates)}</p>
    </>
  );
};
export default Scheduler;
