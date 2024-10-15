'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, TextField } from '@radix-ui/themes';
import dynamic from 'next/dynamic';
import { PropertyType } from '@/repository/property-listings/property-news/types';

const SearchBox = dynamic(() => import('@mapbox/search-js-react').then(mod => mod.SearchBox as any), { ssr: false });

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

const theme = {
  variables: {
    colorBackground: 'black',
    colorText: 'white',
    colorTextInput: 'white',
    colorTextPlaceholder: 'grey',
    colorBackgroundHover: '#333333',
    colorBackgroundSelected: '#444444',
    borderRadius: '8px',
  },
  cssText: `
    .Input {
      background-color: black;
      color: white !important;
      border: 0.5px solid #444 !important;
      border-radius: 8px !important;
    }
    .Input::placeholder {
      color: grey;
    }
    .Suggestion {
      background-color: black;
      color: white;
      border: none !important;
    }
    .Suggestion--selected {
      background-color: #333333;
      color: white;
    }
    .SearchBox {
      border: 0.5px solid #444 !important;
      box-shadow: none !important;
      border-radius: 8px !important;
      overflow: hidden !important;
    }
    .SearchBox-input {
      border-radius: 8px !important;
    }
  `,
};

export function SelectionView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialState = {
    minPrice: searchParams?.get('minPrice') || '',
    maxPrice: searchParams?.get('maxPrice') || '',
    type: searchParams?.get('type')?.split(',') || [],
    location: searchParams?.get('location') || '',
    distance: Number(searchParams?.get('distance')) || 15,
    lat: parseFloat(searchParams?.get('lat') || '') || null,
    lng: parseFloat(searchParams?.get('lng') || '') || null,
  };

  const [location, setLocation] = useState(initialState.location);
  const [distance, setDistance] = useState(initialState.distance);
  const [coordinates, setCoordinates] = useState({ lat: initialState.lat, lng: initialState.lng });

  const allPropertyTypes = Object.keys(propertyTypeLabels).map(key => ({
    id: key as PropertyType,
    label: propertyTypeLabels[key as PropertyType] || key,
  }));
  const propertyTypes = allPropertyTypes.filter(pt => pt.id !== PropertyType.SpecialUse);

  const handleFilterChange = (filterName: string, value: string) => {
    const updatedQuery = updateSearchQuery(searchParams, filterName, value);
    const queryString = new URLSearchParams(updatedQuery).toString();
    router.push(`?${queryString}`, { shallow: true } as any);
  };

  function updateSearchQuery(existingParams: URLSearchParams, newParamKey: string, newParamValue: any) {
    const updatedParams = new URLSearchParams(existingParams.toString());

    if (newParamValue !== '' && newParamValue !== null && newParamValue !== undefined) {
      updatedParams.set(newParamKey, newParamValue);
    } else {
      updatedParams.delete(newParamKey);
    }

    return updatedParams;
  }

  function handleLocationChange(result: any) {
    const feature = result.features[0];
    const newLocation = feature.properties.place_formatted;
    const [lng, lat] = feature.geometry.coordinates;
    setLocation(newLocation);
    setCoordinates({ lat, lng });

    const updatedParams = new URLSearchParams();

    if (initialState.minPrice) updatedParams.set('minPrice', initialState.minPrice);
    if (initialState.maxPrice) updatedParams.set('maxPrice', initialState.maxPrice);
    if (initialState.type.length) updatedParams.set('type', initialState.type.join(','));
    if (newLocation) updatedParams.set('location', newLocation);
    if (distance) updatedParams.set('distance', distance.toString());
    if (lat) updatedParams.set('lat', lat.toString());
    if (lng) updatedParams.set('lng', lng.toString());

    router.push(`?${updatedParams.toString()}`, { shallow: true } as any);
  }

  const handleDistanceChange = (value: number) => {
    setDistance(value);
    handleFilterChange('distance', value.toString());
  };

  // @ts-ignore
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
        <Select.Root size="3" onValueChange={value => handleFilterChange('type', value)}>
          <Select.Trigger className="w-full" placeholder="Select Property Types" />
          <Select.Content>
            {propertyTypes.map(type => (
              <Select.Item key={type.id} value={type.id}>
                {type.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>
      <div className="w-full max-w-[250px]">
        <label htmlFor="location" className="block text-sm font-medium">
          Location
        </label>
        <SearchBox
          // @ts-ignore
          theme={theme}
          options={{
            proximity: {
              lng: -0.1276,
              lat: 51.5074,
            },
          }}
          value={location ? `${location}, UK` : ''}
          onRetrieve={handleLocationChange}
          accessToken={process.env.NEXT_PUBLIC_MAPBOX_API_KEY}
        />
      </div>
      <div className="w-full max-w-[150px]">
        <label htmlFor="distance" className="block text-sm font-medium">
          Distance (miles)
        </label>
        <TextField.Root
          id="distance"
          className="w-full"
          size="3"
          type="number"
          placeholder="Distance"
          value={distance.toString()}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDistanceChange(Number(e.target.value))}
          min={0}
          max={1000}
          step={1}
        />
      </div>
    </div>
  );
}
