'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TextField } from '@radix-ui/themes';
import { PropertyType } from '@/repository/property-listings/property-news/types';
// Import the new MultiSelectFilterWidget
import { MultiSelectFilterWidget } from '@/components/multi-select-filter-widget';

const propertyTypeLabels: Partial<Record<PropertyType, string>> = {
  [PropertyType.Detached]: 'Detached',
  [PropertyType.SemiDetached]: 'Semi Detached',
  [PropertyType.Terraced]: 'Terraced',
  [PropertyType.Apartment]: 'Apartment',
  [PropertyType.Bungalow]: 'Bungalow',
  [PropertyType.Townhouse]: 'Townhouse',
  [PropertyType.Villa]: 'Villa',
  [PropertyType.Cottage]: 'Cottage',
};

export function SelectionView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialState = {
    minPrice: searchParams?.get('minPrice') || '',
    maxPrice: searchParams?.get('maxPrice') || '',
    type: searchParams?.get('type')?.split(',') || [],
    town: searchParams?.get('town') || '',
  };

  const handleFilterChange = (filterName: string, value: string) => {
    const updatedQuery = updateSearchQuery(searchParams, filterName, value);
    const queryString = new URLSearchParams(updatedQuery).toString();
    router.push(`?${queryString}`);
  };

  const allPropertyTypes = Object.keys(propertyTypeLabels).map(key => ({
    id: key as PropertyType,
    label: propertyTypeLabels[key as PropertyType] || key,
  }));
  const propertyTypes = allPropertyTypes.filter(pt => pt.id !== PropertyType.SpecialUse);

  function updateSearchQuery(existingParams: URLSearchParams, newParamKey: string, newParamValue: any) {
    const updatedParams = new URLSearchParams(existingParams.toString());

    if (newParamValue) {
      updatedParams.set(newParamKey, newParamValue);
    } else {
      updatedParams.delete(newParamKey);
    }

    return updatedParams;
  }

  return (
    <div className="flex flex-row justify-center gap-3 w-full p-4 pt-[80px]">
      <div className="w-full max-w-[150px]">
        <label htmlFor="minPrice" className="block text-sm font-medium">
          Min Price
        </label>
        <TextField.Root
          id="minPrice"
          className="w-full"
          size="3"
          placeholder="Min Price"
          value={initialState.minPrice}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('minPrice', e.target.value)}
        />
      </div>
      <div className="w-full max-w-[150px]">
        <label htmlFor="maxPrice" className="block text-sm font-medium">
          Max Price
        </label>
        <TextField.Root
          id="maxPrice"
          className="w-full"
          size="3"
          placeholder="Max Price"
          value={initialState.maxPrice}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('maxPrice', e.target.value)}
        />
      </div>
      <div className="w-full max-w-[250px]">
        <label htmlFor="propertyType" className="block text-sm font-medium">
          Property Type
        </label>

        <MultiSelectFilterWidget
          options={propertyTypes}
          itemName={{ single: 'Type', plural: 'Types' }}
          selectedIds={initialState.type}
          setSelectedIds={(newTypes: string[]) => {
            handleFilterChange(
              'type',
              // @ts-ignore
              Array.isArray(newTypes) ? newTypes.join(',') : newTypes.length > 0 ? [newTypes] : ''
            );
          }}
          placeholder="Select Property Types"
        />
      </div>
      <div className="w-full max-w-[150px]">
        <label htmlFor="town" className="block text-sm font-medium">
          Town
        </label>
        <TextField.Root
          id="town"
          className="w-full"
          size="3"
          placeholder="Town"
          value={initialState.town}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('town', e.target.value)}
        />
      </div>
    </div>
  );
}
