// Helper function to query the API for a batch of results
import axios from 'axios';
import { PropertySector, PropertyStatus } from '@/repository/property-listings/constants';
import { getLogger } from '@/utils/logging/logger';
import { PropertyListing_PropertyNews } from '@/repository/property-listings/property-news/types';

type PropertyNewsStatus = 'For Sale' | 'Sale Agreed' | 'For Rent' | 'Let Agreed' | 'Under Offer';
type PropertyNewsSector = 'Residential' | 'Commercial';

const PropertyNewsStatus_MAP: Record<PropertyStatus, PropertyNewsStatus> = {
  'for-sale': 'For Sale',
  'sale-agreed': 'Sale Agreed',
  'for-rent': 'For Rent',
  'let-agreed': 'Let Agreed',
  'under-offer': 'Under Offer',
};

const PropertyNewsSector_MAP: Record<PropertySector, PropertyNewsSector> = {
  residential: 'Residential',
  commercial: 'Commercial',
};

function buildQueryParam(key: string, value: any) {
  return `${key}=${encodeURIComponent(value)}`;
}

export async function getPropertyListings(input: {
  correlationId: string;
  status: PropertyStatus;
  sector: PropertySector;
  price?: { min?: number; max?: number };
  offset: number;
  limit: number;
}): Promise<{ results: PropertyListing_PropertyNews[]; totalCount: number }> {
  const { correlationId, status, sector, offset, limit, price } = input;

  const logger = getLogger('getPropertyListings', { correlationId });
  logger.info('Getting Property News listings', input);

  const propertyNewsStatus = PropertyNewsStatus_MAP[status];
  const propertyNewsSector = PropertyNewsSector_MAP[sector];

  const queryParams = [
    buildQueryParam('status[]', propertyNewsStatus),
    buildQueryParam('sector[]', propertyNewsSector),
    buildQueryParam('offset', offset),
    buildQueryParam('limit', limit),
    ...(price?.min ? [buildQueryParam('minPrice', price.min)] : []),
    ...(price?.max ? [buildQueryParam('maxPrice', price.max)] : []),
  ];

  // const url = `https://beta-api.propertynews.com/v3/property/results/?${queryParams.join('&')}`;
  const url = `https://beta-api.propertynews.com/v3/property/results/?${queryParams.join('&')}&propertyType[]=Semi-Detached+Houses`;

  // Make API request with offset and limit query parameters
  const { data } = await axios.get(url);

  logger.debug('Received Property News listings', { resultCount: data.results?.length, totalCount: data.totalCount });

  return data;
}
