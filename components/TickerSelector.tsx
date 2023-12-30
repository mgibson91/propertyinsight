// src/components/TickerSelector.tsx
import { Select } from '@radix-ui/themes';
import { FC } from 'react';
// import Select from 'react-select';

interface TickerSelectorProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (ticker: string) => void;
}

const TickerSelector: FC<TickerSelectorProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <Select.Root
      value={value}
      onValueChange={(selectedOption) => onChange(selectedOption)}
    >
      <Select.Trigger
        placeholder="Select ticker"
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

export default TickerSelector;
