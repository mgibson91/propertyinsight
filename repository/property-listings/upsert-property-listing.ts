// @ts-nocheck
import { getLogger } from '../../utils/logging/logger';
import { db } from '../kysely-connection';
import { ListingSource } from '@/repository/property-listings/types';
import { PropertyType } from '@/repository/kysely-types';

const logger = getLogger('upsertPropertyListing');

interface PropertyListingMetadata {
  // Define the structure of your metadata here
}

export interface UpsertPropertyListingInput {
  id: string;
  price: number;
  currency: string;
  address: {
    line1?: string;
    line2?: string;
    town?: string;
    postcode?: string;
  };
  type: string;
  bedrooms: string;
  receptions: number;
  metadata: PropertyListingMetadata;
  source: ListingSource;
}

export async function upsertPropertyListing(propertyListing: UpsertPropertyListingInput): Promise<string> {
  try {
    const { line1, line2, town, postcode } = propertyListing.address;

    if (!line1 || !town || !postcode) {
      logger.error('Address must include line1, town, and postcode');
      throw new Error('Address must include line1, town, and postcode');
    }

    const addressQuery = db
      .selectFrom('addresses')
      .select('property_id')
      .where('line1', '=', line1)
      .where('town', '=', town)
      .where('postcode', '=', postcode);

    if (line2) {
      addressQuery.where('line2', '=', line2);
    }

    const existingAddress = await addressQuery.executeTakeFirst();

    let resultId: string;

    if (!existingAddress) {
      const [result] = await db
        .insertInto('property_listings')
        .values({
          source_id: propertyListing.id,
          price: propertyListing.price,
          currency: propertyListing.currency,
          type: propertyListing.type,
          bedrooms: propertyListing.bedrooms,
          receptions: propertyListing.receptions,
          metadata: JSON.stringify(propertyListing.metadata),
          source: propertyListing.source,
        })
        .returning('id')
        .execute();

      resultId = result.id;
      logger.info('Property listing added successfully', { id: resultId });

      const addressInsert = db.insertInto('addresses').values({
        property_id: resultId,
        line1,
        town,
        postcode,
      });

      if (line2) {
        addressInsert.values({ line2 });
      }

      await addressInsert.execute();
    } else {
      const listingQuery = db
        .selectFrom('property_listings')
        .select('id')
        .where('id', '=', existingAddress.property_id);

      const existingListing = await listingQuery.executeTakeFirst();

      if (existingListing) {
        const [result] = await db
          .updateTable('property_listings')
          .set({
            price: propertyListing.price,
            currency: propertyListing.currency,
            type: propertyListing.type,
            bedrooms: propertyListing.bedrooms,
            receptions: propertyListing.receptions,
            metadata: JSON.stringify(propertyListing.metadata),
            source: propertyListing.source,
          })
          .where('id', '=', existingListing.id)
          .returning('id')
          .execute();

        resultId = result.id;
        logger.info('Property listing updated successfully', { id: resultId });
      } else {
        const [result] = await db
          .insertInto('property_listings')
          .values({
            id: propertyListing.id,
            price: propertyListing.price,
            currency: propertyListing.currency,
            type: propertyListing.type,
            bedrooms: propertyListing.bedrooms,
            receptions: propertyListing.receptions,
            metadata: JSON.stringify(propertyListing.metadata),
            source: propertyListing.source,
          })
          .returning('id')
          .execute();

        resultId = result.id;
        logger.info('Property listing added successfully', { id: resultId });
      }
    }

    return resultId;
  } catch (error) {
    logger.error('Error upserting property listing', error || {});
    throw error;
  }
}
