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
  };
}) {
  const filters = {
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    type: (searchParams.type ? searchParams.type.split(',') : []) as PropertyType[],
    town: searchParams.town,
    page: parseInt(searchParams.page, 10) || 1,
    limit: parseInt(searchParams.limit, 10) || 10,
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
