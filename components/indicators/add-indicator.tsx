'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, TextFieldInput } from '@radix-ui/themes';
import { Indicator } from '@/logic/indicators/types';
import { AvatarIcon, CheckIcon, GlobeIcon } from '@radix-ui/react-icons';
import { PRESET_INDICATOR_BOLLINGER_BANDS } from '@/logic/indicators/preset-indicator';

enum Category {
  MyLibrary = 'My Library',
  Standard = 'Standard',
  Community = 'Community',
}

const categoryIcons = {
  [Category.MyLibrary]: AvatarIcon,
  [Category.Standard]: CheckIcon,
  [Category.Community]: GlobeIcon,
};

const IndicatorSearchView = ({
  indicators,
  onItemClicked,
}: {
  indicators: Indicator[];
  onItemClicked: (item: Indicator) => void;
}) => {
  const [category, setCategory] = useState(Category.MyLibrary);
  const [search, setSearch] = useState('');
  const [filteredIndicators, setFilteredIndicators] = useState(indicators);

  const renderCategoryButton = (categoryKey: Category) => {
    const Icon = categoryIcons[categoryKey]; // Dynamically select the icon
    const isSelected = category === categoryKey; // Check if this category is selected

    return (
      <Button
        key={categoryKey}
        variant="ghost"
        className={`w-full max-w-[100px] !m-0 !justify-start ${isSelected ? 'font-extrabold underline' : ''}`}
        onClick={() => setCategory(categoryKey)} // Update the current category on click
      >
        <div className={''}>
          <Icon className={`${isSelected ? 'font-extrabold' : ''}`} />
        </div>
        <span>{categoryKey}</span>
        {/*<Icon className={`${isSelected ? 'font-extrabold' : ''}`} /> {categoryKey}*/}
      </Button>
    );
  };

  useEffect(() => {
    let sourcedIndicators: Indicator[] = [];

    if (category === Category.MyLibrary) {
      sourcedIndicators = [PRESET_INDICATOR_BOLLINGER_BANDS];
    } else if (category === Category.Standard) {
      sourcedIndicators = indicators;
    }

    const filtered = sourcedIndicators
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

    setFilteredIndicators(filtered as Indicator[]);
  }, [search, indicators, category]);

  const highlightMatch = (label: string, matches: { start: number; end: number }[]) => {
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
    <div className="w-full min-h-[200px] h-[300px] overflow-hidden">
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
      <div className={'flex flex-row gap-3  !max-h-[300px]'}>
        {/*<div className={'flex flex-col border border-primary-border rounded-lg'}>My Library</div>*/}
        <div className={'flex flex-col gap-2 items-start w-[120px]'}>
          {Object.values(Category).map(cat => (
            <>{renderCategoryButton(cat)}</>
          ))}

          {/*<div className={'w-full flex justify-start'}>*/}
          {/*  <Button*/}
          {/*    variant={'ghost'}*/}
          {/*    className={`!m-0 flex-1 !justify-start ${category === Category.MyLibrary ? 'font-extrabold underline' : ''}`}*/}
          {/*  >*/}
          {/*    <AvatarIcon className={`${category === Category.MyLibrary ? 'font-extrabold' : ''}`} />{' '}*/}
          {/*    {Category.MyLibrary}*/}
          {/*  </Button>*/}
          {/*</div>*/}

          {/*<div className={'w-full flex'}>*/}
          {/*  <Button variant={'ghost'} className={'!m-0 flex-1  !justify-start'}>*/}
          {/*    <CheckIcon /> {Category.Standard}*/}
          {/*  </Button>*/}
          {/*</div>*/}

          {/*<div className={'w-full flex justify-start'}>*/}
          {/*  <Button variant={'ghost'} className={'!m-0 flex-1  !justify-start'}>*/}
          {/*    <GlobeIcon /> {Category.Community}*/}
          {/*  </Button>*/}
          {/*</div>*/}
        </div>

        {/*Vertical divided*/}
        <div className={'border-r border-primary-border h-full w-[10px]'}></div>

        <div className="flex flex-col gap-2 overflow-auto w-full">
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
    </div>
  );
};

export default IndicatorSearchView;
