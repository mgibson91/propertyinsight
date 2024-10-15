import { db } from '../kysely-connection';
import { getLogger } from '../../utils/logging/logger';
import { PropertyListings, PropertyType } from '../kysely-types';
import { sql } from 'kysely';

const logger = getLogger('getPropertyListings');

export interface PropertyListingModel {
  id: string;
  price: number;
  currency: string;
  address: {
    line1: string | null;
    line2: string | null;
    town: string | null;
    postcode: string | null;
  };
  type: string;
  bedrooms: number;
  receptions: number;
}

export interface GetPropertyListingsFilters {
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  town?: string;
  postcode?: string;
  bedrooms?: number;
  receptions?: number;
  type?: PropertyType[];
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  distanceKm?: number; // in kilometers
}

export interface PropertyListingsSummary {
  total: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  avgBedrooms: number;
  avgReceptions: number;
  medianPrice: number;
}

export async function getPropertyListings(filters: GetPropertyListingsFilters): Promise<PropertyListingModel[]> {
  logger.info('Retrieving property listings', filters);

  try {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    let query = db
      .selectFrom('property_listings')
      .innerJoin('addresses', 'property_listings.id', 'addresses.property_id')
      .select([
        'property_listings.id',
        'property_listings.price',
        'property_listings.currency',
        'property_listings.type',
        'property_listings.bedrooms',
        'property_listings.receptions',
        'addresses.line1',
        'addresses.line2',
        'addresses.town',
        'addresses.postcode',
      ])
      .limit(limit)
      .offset(offset);

    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      query = query.where('property_listings.price', '>=', filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      query = query.where('property_listings.price', '<=', filters.maxPrice.toString());
    }
    if (filters.currency) {
      query = query.where('property_listings.currency', '=', filters.currency);
    }
    if (filters.town) {
      query = query.where('addresses.town', '=', filters.town);
    }
    if (filters.postcode) {
      query = query.where('addresses.postcode', '=', filters.postcode);
    }
    if (filters.bedrooms !== undefined) {
      query = query.where('property_listings.bedrooms', '=', filters.bedrooms);
    }
    if (filters.receptions !== undefined) {
      query = query.where('property_listings.receptions', '=', filters.receptions);
    }
    if (filters.type && filters.type.length > 0) {
      query = query.where('property_listings.type', 'in', filters.type);
    }
    if (filters.lat !== undefined && filters.lng !== undefined && filters.distanceKm !== undefined) {
      query = query.where(
        sql`postgis.ST_DWithin(coordinates, postgis.ST_MakePoint(${filters.lng}, ${filters.lat})::postgis.geography, ${filters.distanceKm} * 1000)`
      );
    }

    const listings = await query.execute();

    return listings.map(listing => ({
      id: listing.id,
      price: parseFloat(listing.price),
      currency: listing.currency,
      address: {
        line1: listing.line1,
        line2: listing.line2,
        town: listing.town,
        postcode: listing.postcode,
      },
      type: listing.type,
      bedrooms: listing.bedrooms,
      receptions: listing.receptions,
    }));
  } catch (error) {
    logger.error('Error retrieving property listings', error || {});
    throw error;
  }
}

export async function getPropertyListingsSummary(
  filters: GetPropertyListingsFilters
): Promise<PropertyListingsSummary> {
  logger.info('Retrieving property listings summary', filters);

  try {
    let query = db
      .selectFrom('property_listings')
      .innerJoin('addresses', 'property_listings.id', 'addresses.property_id')
      .select([
        sql`COUNT(*)`.as('total'),
        sql`MIN(property_listings.price)`.as('minPrice'),
        sql`MAX(property_listings.price)`.as('maxPrice'),
        sql`AVG(property_listings.price)`.as('avgPrice'),
        sql`AVG(property_listings.bedrooms)`.as('avgBedrooms'),
        sql`AVG(property_listings.receptions)`.as('avgReceptions'),
        sql`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY property_listings.price)`.as('medianPrice'),
      ]);

    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      query = query.where('property_listings.price', '>=', filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      query = query.where('property_listings.price', '<=', filters.maxPrice.toString());
    }
    if (filters.currency) {
      query = query.where('property_listings.currency', '=', filters.currency);
    }
    if (filters.town) {
      query = query.where('addresses.town', '=', filters.town);
    }
    if (filters.postcode) {
      query = query.where('addresses.postcode', '=', filters.postcode);
    }
    if (filters.bedrooms !== undefined) {
      query = query.where('property_listings.bedrooms', '=', filters.bedrooms);
    }
    if (filters.receptions !== undefined) {
      query = query.where('property_listings.receptions', '=', filters.receptions);
    }
    if (filters.type && filters.type.length > 0) {
      query = query.where('property_listings.type', 'in', filters.type);
    }
    if (filters.lat !== undefined && filters.lng !== undefined && filters.distanceKm !== undefined) {
      query = query.where(
        sql`postgis.ST_DWithin(coordinates, postgis.ST_MakePoint(${filters.lng}, ${filters.lat})::postgis.geography, ${filters.distanceKm} * 1000)`
      );
    }

    const [summary] = await query.execute();

    return {
      total: parseInt(summary.total as string, 10),
      minPrice: parseFloat(summary.minPrice as string),
      maxPrice: parseFloat(summary.maxPrice as string),
      avgPrice: parseFloat(summary.avgPrice as string),
      avgBedrooms: parseFloat(summary.avgBedrooms as string),
      avgReceptions: parseFloat(summary.avgReceptions as string),
      medianPrice: parseFloat(summary.medianPrice as string),
    };
  } catch (error) {
    logger.error('Error retrieving property listings summary', error || {});
    throw error;
  }
}
