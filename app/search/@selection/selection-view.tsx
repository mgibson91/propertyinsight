'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, TextField, Button, Dialog, Heading } from '@radix-ui/themes';
import dynamic from 'next/dynamic';
import { PropertyType } from '@/repository/property-listings/property-news/types';
import { Chip } from '@/components/ui/chip';
import { Cross2Icon } from '@radix-ui/react-icons';

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
      min-height: 39px !important;
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
    bathroomsFrom: searchParams?.get('bathroomsFrom') || '',
    bathroomsTo: searchParams?.get('bathroomsTo') || '',
    receptionsFrom: searchParams?.get('receptionsFrom') || '',
    receptionsTo: searchParams?.get('receptionsTo') || '',
    bedroomsFrom: searchParams?.get('bedroomsFrom') || '',
    bedroomsTo: searchParams?.get('bedroomsTo') || '',
  };

  const [location, setLocation] = useState(initialState.location);
  const [distance, setDistance] = useState(initialState.distance);
  const [coordinates, setCoordinates] = useState({ lat: initialState.lat, lng: initialState.lng });
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [bathroomsFrom, setBathroomsFrom] = useState(initialState.bathroomsFrom);
  const [bathroomsTo, setBathroomsTo] = useState(initialState.bathroomsTo);
  const [receptionsFrom, setReceptionsFrom] = useState(initialState.receptionsFrom || '');
  const [receptionsTo, setReceptionsTo] = useState(initialState.receptionsTo || '');
  const [bedroomsFrom, setBedroomsFrom] = useState(initialState.bedroomsFrom || '');
  const [bedroomsTo, setBedroomsTo] = useState(initialState.bedroomsTo || '');
  const [activeFilters, setActiveFilters] = useState<Array<{ name: string; value: string }>>([]);
  const [selectedType, setSelectedType] = useState<string | undefined>(initialState.type.join(',') || undefined);

  useEffect(() => {
    updateActiveFilters();
  }, [searchParams]);

  useEffect(() => {
    if (selectedType === undefined) {
      handleFilterChange('type', '');
    } else {
      handleFilterChange('type', selectedType);
    }
  }, [selectedType]);

  const updateActiveFilters = () => {
    const newActiveFilters = [];
    if (searchParams?.get('minPrice')) {
      newActiveFilters.push({ name: 'minPrice', value: searchParams.get('minPrice')! });
    }
    if (searchParams?.get('maxPrice')) {
      newActiveFilters.push({ name: 'maxPrice', value: searchParams.get('maxPrice')! });
    }
    if (searchParams?.get('type')) {
      newActiveFilters.push({ name: 'type', value: searchParams.get('type')! });
    }
    if (searchParams?.get('location')) {
      newActiveFilters.push({ name: 'location', value: searchParams.get('location')! });
    }
    if (searchParams?.get('distance')) {
      newActiveFilters.push({ name: 'distance', value: searchParams.get('distance')! });
    }
    if (searchParams?.get('receptionsFrom')) {
      newActiveFilters.push({ name: 'receptionsFrom', value: searchParams.get('receptionsFrom')! });
    }
    if (searchParams?.get('receptionsTo')) {
      newActiveFilters.push({ name: 'receptionsTo', value: searchParams.get('receptionsTo')! });
    }
    if (searchParams?.get('bedroomsFrom')) {
      newActiveFilters.push({ name: 'bedroomsFrom', value: searchParams.get('bedroomsFrom')! });
    }
    if (searchParams?.get('bedroomsTo')) {
      newActiveFilters.push({ name: 'bedroomsTo', value: searchParams.get('bedroomsTo')! });
    }
    setActiveFilters(newActiveFilters);
  };

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

  const handleMoreFiltersChange = () => {
    let updatedQuery = updateSearchQuery(searchParams, 'bathroomsFrom', bathroomsFrom);
    updatedQuery = updateSearchQuery(updatedQuery, 'bathroomsTo', bathroomsTo);
    updatedQuery = updateSearchQuery(updatedQuery, 'receptionsFrom', receptionsFrom);
    updatedQuery = updateSearchQuery(updatedQuery, 'receptionsTo', receptionsTo);
    updatedQuery = updateSearchQuery(updatedQuery, 'bedroomsFrom', bedroomsFrom);
    updatedQuery = updateSearchQuery(updatedQuery, 'bedroomsTo', bedroomsTo);
    const queryString = new URLSearchParams(updatedQuery).toString();
    router.push(`?${queryString}`, { shallow: true } as any);
    setIsMoreFiltersOpen(false);
  };

  const removeFilter = (filterName: string) => {
    const updatedQuery = updateSearchQuery(searchParams, filterName, '');
    const queryString = new URLSearchParams(updatedQuery).toString();
    router.push(`?${queryString}`, { shallow: true } as any);

    switch (filterName) {
      case 'minPrice':
        handleFilterChange('minPrice', '');
        break;
      case 'maxPrice':
        handleFilterChange('maxPrice', '');
        break;
      case 'type':
        setSelectedType(undefined);
        break;
      case 'location':
        setLocation('');
        setCoordinates({ lat: null, lng: null });
        break;
      case 'distance':
        setDistance(15);
        break;
      case 'receptionsFrom':
        setReceptionsFrom('');
        break;
      case 'receptionsTo':
        setReceptionsTo('');
        break;
      case 'bedroomsFrom':
        setBedroomsFrom('');
        break;
      case 'bedroomsTo':
        setBedroomsTo('');
        break;
    }
  };

  const getChipLabel = (filterName: string) => {
    switch (filterName) {
      case 'minPrice':
        return 'Min Price';
      case 'maxPrice':
        return 'Max Price';
      case 'type':
        return 'Property Type';
      case 'location':
        return 'Location';
      case 'distance':
        return 'Distance';
      case 'receptionsFrom':
        return 'Min Receptions';
      case 'receptionsTo':
        return 'Max Receptions';
      case 'bedroomsFrom':
        return 'Min Bedrooms';
      case 'bedroomsTo':
        return 'Max Bedrooms';
      default:
        return filterName;
    }
  };

  return (
    <div className="flex flex-col w-full p-4 pt-[80px]">
      <div className="flex flex-row justify-center items-end gap-3 w-full">
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
          <Select.Root size="3" value={selectedType} onValueChange={value => setSelectedType(value)}>
            <Select.Trigger className="!w-full" placeholder="Select Property Type" />
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
        <Button onClick={() => setIsMoreFiltersOpen(true)}>More Filters</Button>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-row flex-wrap gap-2 mt-4">
          {activeFilters.map(filter => (
            <Chip
              key={filter.name}
              name={`${getChipLabel(filter.name)}: ${filter.value}`}
              onDelete={() => removeFilter(filter.name)}
            />
          ))}
        </div>
      )}

      <Dialog.Root open={isMoreFiltersOpen} onOpenChange={setIsMoreFiltersOpen}>
        <Dialog.Content className="w-full !max-w-[300px]">
          <Dialog.Title>
            <Heading size="4" className="mb-4">
              More Filters
            </Heading>
          </Dialog.Title>
          <div className="flex flex-col gap-4 w-full">
            <div className="w-full">
              <Heading size="3" className="">
                Bedrooms
              </Heading>
              <div className="flex flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="bedroomsFrom" className="block text-sm font-medium mb-1">
                    From
                  </label>
                  <TextField.Root
                    id="bedroomsFrom"
                    value={bedroomsFrom}
                    onChange={e => setBedroomsFrom(e.target.value)}
                    type="number"
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="bedroomsTo" className="block text-sm font-medium mb-1">
                    To
                  </label>
                  <TextField.Root
                    id="bedroomsTo"
                    value={bedroomsTo}
                    onChange={e => setBedroomsTo(e.target.value)}
                    type="number"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <div className="w-full">
              <Heading size="3" className="">
                Bathrooms
              </Heading>
              <div className="flex flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="bathroomsFrom" className="block text-sm font-medium mb-1">
                    From
                  </label>
                  <TextField.Root
                    id="bathroomsFrom"
                    value={bathroomsFrom}
                    onChange={e => setBathroomsFrom(e.target.value)}
                    type="number"
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="bathroomsTo" className="block text-sm font-medium mb-1">
                    To
                  </label>
                  <TextField.Root
                    id="bathroomsTo"
                    value={bathroomsTo}
                    onChange={e => setBathroomsTo(e.target.value)}
                    type="number"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <div className="w-full">
              <Heading size="3" className="">
                Receptions
              </Heading>
              <div className="flex flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="receptionsFrom" className="block text-sm font-medium mb-1">
                    From
                  </label>
                  <TextField.Root
                    id="receptionsFrom"
                    value={receptionsFrom}
                    onChange={e => setReceptionsFrom(e.target.value)}
                    type="number"
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="receptionsTo" className="block text-sm font-medium mb-1">
                    To
                  </label>
                  <TextField.Root
                    id="receptionsTo"
                    value={receptionsTo}
                    onChange={e => setReceptionsTo(e.target.value)}
                    type="number"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          <Dialog.Close>
            <Button className="!mt-6 w-full" onClick={handleMoreFiltersChange}>
              Apply Filters
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
