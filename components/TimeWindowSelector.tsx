// src/components/TimeWindowSelector.tsx
import { FC } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TimeWindowSelectorProps {
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
}

const TimeWindowSelector: FC<TimeWindowSelectorProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  return (
    <div>
      <DatePicker
        selected={startDate}
        onChange={(date: Date) => setStartDate(date)}
      />
      <DatePicker
        selected={endDate}
        onChange={(date: Date) => setEndDate(date)}
      />
    </div>
  );
};

export default TimeWindowSelector;
