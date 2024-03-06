'use client';

import React, { useEffect, useState } from 'react';
import { Card, TextFieldInput } from '@radix-ui/themes';
import { Indicator } from '@/logic/indicators/types';

const IndicatorSearchView = ({
  indicators,
  onItemClicked,
}: {
  indicators: Indicator[];
  onItemClicked: (item: Indicator) => void;
}) => {
  const [search, setSearch] = useState('');
  const [filteredIndicators, setFilteredIndicators] = useState(indicators);

  useEffect(() => {
    const filtered = indicators
      .map(indicator => {
        const labelLower = indicator.label.toLowerCase();
        const searchLower = search.toLowerCase();
        let matches = [];

        // Direct substring match
        if (labelLower.includes(searchLower)) {
          const start = labelLower.indexOf(searchLower);
          const end = start + searchLower.length;
          matches.push({ start, end });
        } else {
          // First letter match logic
          const words = labelLower.split(' ');
          const firstLetters = words.map(word => word[0]).join('');
          const regexPattern = searchLower.split('').join('.*?'); // Creates a regex pattern to match letters in order
          const regex = new RegExp(regexPattern);

          if (regex.test(firstLetters)) {
            let currentIndex = 0;
            searchLower.split('').forEach(char => {
              const charIndex = firstLetters.indexOf(char, currentIndex);
              if (charIndex !== -1) {
                // Finding the position of the word corresponding to the matched first letter
                const wordStartPosition = words.slice(0, charIndex).reduce((acc, curr) => acc + curr.length + 1, 0);
                matches.push({ start: wordStartPosition, end: wordStartPosition + 1 });
                currentIndex = charIndex + 1;
              }
            });
          }
        }

        if (matches.length > 0) {
          return { ...indicator, matches };
        }
        return null;
      })
      .filter(Boolean);

    setFilteredIndicators(filtered);
  }, [search, indicators]);

  const highlightMatch = (label, matches) => {
    let result = [];
    let lastIndex = 0;
    matches
      .sort((a, b) => a.start - b.start)
      .forEach((match, index) => {
        const start = match.start;
        const end = match.end;
        if (start > lastIndex) {
          result.push(<span key={`text-${index}-${lastIndex}`}>{label.slice(lastIndex, start)}</span>);
        }
        result.push(
          <span key={`highlight-${index}-${start}`} className={'bg-accent-bg-active rounded-sm'}>
            {label.slice(start, end)}
          </span>
        );
        lastIndex = end;
      });
    if (lastIndex < label.length) {
      result.push(<span key={`text-end-${lastIndex}`}>{label.slice(lastIndex)}</span>);
    }
    return result;
  };

  return (
    <div className="w-full min-h-[200px]">
      <div className="mb-4">
        <TextFieldInput
          autoFocus={true}
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
            onClick={() => onItemClicked(indicator)}
            key={indicator.tag}
            className="bg-primary-bg cursor-pointer hover:bg-primary-bg-active p-2 text-left rounded-lg"
          >
            {highlightMatch(indicator.label, indicator.matches || [])}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndicatorSearchView;
