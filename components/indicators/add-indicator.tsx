'use client';

import React, { useEffect } from 'react';
import { Card, TextFieldInput } from '@radix-ui/themes';
import { Indicator } from '@/logic/indicators/types';

const IndicatorSearchView = ({
  indicators,
  onItemClicked,
}: {
  indicators: Indicator[];
  onItemClicked: (item: Indicator) => void;
}) => {
  const [search, setSearch] = React.useState('');
  const [filteredIndicators, setFilteredIndicators] = React.useState(indicators);

  useEffect(() => {
    const filtered = indicators.filter(indicator => indicator.label.toLowerCase().includes(search.toLowerCase()));
    setFilteredIndicators(filtered);
  }, [search]);

  return (
    <div className="w-full min-h-[200px]">
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
            onClick={() => {
              onItemClicked(indicator);
            }}
            key={indicator.id}
            className="bg-primary-bg cursor-pointer hover:bg-primary-bg-active p-2 text-left rounded-lg"
          >
            {indicator.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndicatorSearchView;
