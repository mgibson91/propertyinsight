'use client';

import React, { useEffect, useState } from 'react';
import { TextFieldInput } from '@radix-ui/themes';

// Define a generic type for items that might have matching highlights
type ItemWithMatches<T> = T & { matches?: { start: number; end: number }[] };

// Generic component props
type SearchViewProps<T> = {
  items: T[];
  onItemClicked: (item: T) => void;
  searchTextExtractor: (item: T) => string; // Function to extract the text to search and highlight
  filterItems: (items: T[], search: string) => ItemWithMatches<T>[]; // Function to filter items and optionally calculate matches
};

function SearchView<T>({ items, onItemClicked, searchTextExtractor, filterItems }: SearchViewProps<T>) {
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState<ItemWithMatches<T>[]>([]);

  useEffect(() => {
    setFilteredItems(filterItems(items, search));
  }, [search, items, filterItems]);

  // Highlight logic embedded within the component
  const highlightMatch = (item: ItemWithMatches<T>, key: string | number) => {
    const text = searchTextExtractor(item);
    const matches = item.matches || [];
    let result: React.ReactNode[] = [];
    let lastIndex = 0;
    matches.forEach((match, index) => {
      const start = match.start;
      const end = match.end;
      if (start > lastIndex) {
        result.push(<span key={`text-${key}-${lastIndex}`}>{text.slice(lastIndex, start)}</span>);
      }
      result.push(
        <span key={`highlight-${key}-${start}`} className="bg-accent-bg-active rounded-sm">
          {text.slice(start, end)}
        </span>
      );
      lastIndex = end;
    });
    if (lastIndex < text.length) {
      result.push(<span key={`text-end-${key}-${lastIndex}`}>{text.slice(lastIndex)}</span>);
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
        {filteredItems.map((item, index) => (
          <div
            onClick={() => onItemClicked(item)}
            key={`item-${index}`}
            className="bg-primary-bg cursor-pointer hover:bg-primary-bg-active p-2 text-left rounded-lg"
          >
            {highlightMatch(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchView;

/**
 const IndicatorSearchView = SearchView<Indicator>;

 <IndicatorSearchView
   items={PRESET_INDICATORS}
   onItemClicked={(indicator: Indicator) => {
   onIndicatorSelected(indicator);
   }}
   searchTextExtractor={indicator => indicator.label}
   filterItems={(items, search) =>
   items.filter(indicator => indicator.label.toLowerCase().includes(search.toLowerCase()))
   }
 />
 */
