'use client';

import React, { useEffect } from 'react';
import { Card, TextFieldInput } from '@radix-ui/themes';
import { Indicator } from '@/common/indicator/types';

const AddIndicatorView = ({ indicators }: { indicators: Indicator[] }) => {
  const [search, setSearch] = React.useState('');
  const [filteredIndicators, setFilteredIndicators] = React.useState(indicators);

  useEffect(() => {
    const filtered = indicators.filter(indicator => indicator.label.toLowerCase().includes(search.toLowerCase()));
    setFilteredIndicators(filtered);
  }, [search]);

  // const filteredIndicators = indicators.filter(indicator =>
  //   indicator.name.toLowerCase().includes(search.toLowerCase())
  // );

  return (
    <Card className="max-w-sm w-full">
      <div className="mb-4">
        <TextFieldInput
          className="w-full"
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        {filteredIndicators.map(indicator => (
          <div
            key={indicator.id}
            className="bg-primary-bg cursor-pointer hover:bg-primary-bg-active p-2 text-left rounded-lg"
          >
            {indicator.label}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AddIndicatorView;
