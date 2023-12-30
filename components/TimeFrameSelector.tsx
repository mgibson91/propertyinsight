// src/components/TimeFrameSelector.tsx
import { Select } from '@radix-ui/themes';
import { FC } from 'react';

interface TimeFrameSelectorProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (timeframe: string) => void;
}

const TimeFrameSelector: FC<TimeFrameSelectorProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    // Update to use Radix UI Select
    <Select.Root
      value={value}
      onValueChange={(selectedOption) => onChange(selectedOption)}
    >
      <Select.Trigger
        placeholder="Select timeframe"
        className={'bg-primary-bg-subtle h-[32px]'}
      />
      <Select.Content>
        {options.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};

export default TimeFrameSelector;
