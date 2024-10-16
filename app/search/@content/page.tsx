import { getPropertyListings, getPropertyListingsSummary } from '@/repository/property-listings/get-property-listings';
import ClientSearchPage from './client-page';
import { PropertyType } from '@/repository/property-listings/property-news/types';

export default async function Page({
  searchParams,
}: {
  searchParams: {
    minPrice: number;
    maxPrice: number;
    type: string;
    town: string;
    page: string;
    limit: string;
    location: string;
    distance: string;
    lat: string;
    lng: string;
    bathroomsFrom: string;
    bathroomsTo: string;
    receptionsFrom: string;
    receptionsTo: string;
    bedroomsFrom: string;
    bedroomsTo: string;
  };
}) {
  const filters = {
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    type: (searchParams.type ? searchParams.type.split(',') : []) as PropertyType[],
    town: searchParams.town,
    page: parseInt(searchParams.page, 10) || 1,
    limit: parseInt(searchParams.limit, 10) || 10,
    location: searchParams.location,
    distanceKm: parseFloat(searchParams.distance) || undefined,
    lat: parseFloat(searchParams.lat) || undefined,
    lng: parseFloat(searchParams.lng) || undefined,
    bathroomsFrom: parseInt(searchParams.bathroomsFrom, 10) || undefined,
    bathroomsTo: parseInt(searchParams.bathroomsTo, 10) || undefined,
    receptionsFrom: parseInt(searchParams.receptionsFrom, 10) || undefined,
    receptionsTo: parseInt(searchParams.receptionsTo, 10) || undefined,
    bedroomsFrom: parseInt(searchParams.bedroomsFrom, 10) || undefined,
    bedroomsTo: parseInt(searchParams.bedroomsTo, 10) || undefined,
  };

  console.log({ big: '######', searchParams, filters });

  const [listings, summary] = await Promise.all([getPropertyListings(filters), getPropertyListingsSummary(filters)]);

  return (
    <ClientSearchPage
      initialProperties={listings}
      summary={summary}
      initialPage={filters.page}
      itemsPerPage={filters.limit}
    />
  );
}
