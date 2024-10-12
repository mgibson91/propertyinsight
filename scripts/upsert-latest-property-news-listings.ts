import { getPropertyListings } from '@/repository/property-listings/property-news/get-property-listings-property-news';
import { getLogger } from '@/utils/logging/logger';
import {
  upsertPropertyListing,
  UpsertPropertyListingInput,
} from '@/repository/property-listings/upsert-property-listing';
import {
  mapPropertyNewsTypeToPropertyType,
  PropertyListing_PropertyNews,
  PropertyType,
} from '@/repository/property-listings/property-news/types';
import { ListingSource } from '@/repository/property-listings/types';

type PriceRange = {
  min: number;
  max?: number;
};

const correlationId = 'populating-property-news-listings';

async function getPriceRanges(): Promise<PriceRange[]> {
  const priceRanges: PriceRange[] = []; // Array to store price ranges

  const PRICE_INCREMENT = 100000; // Increment for maxPrice

  let minPrice = 0; // Starting min price
  let maxPrice: number | undefined = PRICE_INCREMENT; // Starting max price

  while (true) {
    // Infinite loop until a suitable price range is found or there are no more results
    const { results, totalCount } = await getPropertyListings({
      correlationId: '',
      status: 'for-sale',
      sector: 'residential',
      price: { min: minPrice, max: maxPrice },
      offset: 0,
      limit: 100, // Increase the limit to reduce the number of queries
    });

    if (maxPrice === undefined && totalCount <= 900) {
      priceRanges.push({ min: minPrice }); // Add pr
      break; // Exit the loop as there are no more results
    }

    if (totalCount < 600) {
      priceRanges.push({ min: minPrice, max: maxPrice }); // Add price range to the array
      minPrice = maxPrice! + 1; // Update minPrice for the next query
      maxPrice = undefined;
      continue;
    }

    if (totalCount > 900) {
      if (maxPrice === undefined) {
        // Left unbounded, there are too many results, we need to reset an appropriate limit
        maxPrice = minPrice + PRICE_INCREMENT * 2;
      } else {
        maxPrice -= (maxPrice - minPrice) / 2; // Set minPrice for the next query
      }

      continue;
    }

    if (totalCount >= 600 && totalCount <= 900) {
      // Check for the totalCount condition
      priceRanges.push({ min: minPrice, max: maxPrice }); // Add price range to the array
      minPrice = maxPrice! + 1; // Update minPrice for the next query
      maxPrice = minPrice + PRICE_INCREMENT; // Increment maxPrice for the next query
      continue;
    }
  }

  // while (true) { // Infinite loop until there are no more results
  //   const { results, totalCount } = await getPropertyListings({
  //     correlationId: '',
  //     status: 'for-sale',
  //     sector: 'residential',
  //     price: { min: minPrice, max: maxPrice },
  //     offset: 0,
  //     limit: 100, // Increase the limit to reduce the number of queries
  //   });
  //
  //   if (results.length === 0) { // Check if there are no more results
  //     break; // Exit the loop since there are no more results
  //   }
  //
  //   if (totalCount >= 600 && totalCount <= 900) { // Check for the totalCount condition
  //     priceRanges.push({ min: minPrice, max: maxPrice }); // Add price range to the array
  //     minPrice = maxPrice + 1; // Update minPrice for the next query
  //   }
  //
  //   maxPrice += 10000; // Increment maxPrice for the next query
  // }

  return priceRanges;
}

const resolvedPriceRanges: PriceRange[] = [
  {
    min: 0, // Meant to be from zero but have manually done up to this point
    max: 50000,
  },
  {
    min: 50001,
    max: 75000,
  },
  {
    min: 75001,
    max: 100000,
  },
  {
    min: 100001,
    max: 125001,
  },
  {
    min: 125002,
    max: 150002,
  },
  {
    min: 150003,
    max: 175003,
  },
  {
    min: 175004,
    max: 200004,
  },
  {
    min: 200005,
    max: 250005,
  },
  {
    min: 250006,
    max: 300006,
  },
  {
    min: 300007,
    max: 500007,
  },
  {
    min: 500008,
    max: 600008,
  },
  {
    min: 600009,
  },
];

const logger = getLogger('upsert-latest-property-news-listings');
let overallResultCount = 0;

export function mapToUpsertPropertyListingInput(listing: PropertyListing_PropertyNews): UpsertPropertyListingInput {
  return {
    id: listing.id,
    price: listing.price,
    currency: listing.currency,
    address: listing.address,
    type: mapPropertyNewsTypeToPropertyType(listing.propertyType),
    bedrooms: listing.bedrooms,
    receptions: listing.receptionRooms,
    metadata: listing,
    source: ListingSource.PROPERTY_NEWS,
  };
}

(async () => {
  const ranges = resolvedPriceRanges;
  // const ranges = [{ min: 54949, max: 54951 }];
  // const ranges = [{ min: 19001, max: 30000 }];
  // const ranges = [{ min: 30001, max: 40000 }];
  // const ranges = [{ min: 40001, max: 60000 }];

  for (const range of ranges) {
    logger.info(`Fetching listings for price range`, { range });
    const { min, max } = range;

    let resultCount = 0;
    let offset = 0;
    const limit = 10;

    do {
      if (resultCount % 10 !== 0) {
        logger.info(`All listings retrieved`, { range });
        break;
      }

      const { results } = await getPropertyListings({
        correlationId,
        status: 'for-sale',
        sector: 'residential',
        offset,
        limit,
        price: {
          min,
          max,
        },
      });

      let queryResultCount = results?.length || 0;
      logger.info(`Processing listings ${overallResultCount} to ${overallResultCount + queryResultCount}`, { range });

      try {
        const _listings: UpsertPropertyListingInput[] = results
          .filter(r => r.propertyType)
          .map(mapToUpsertPropertyListingInput);

        const listings = _listings.filter(l => l.type === PropertyType.SemiDetached);

        // Use Promise.allSettled to upsert all listings and log results
        const upsertResults = await Promise.allSettled(listings.map(upsertPropertyListing));

        upsertResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            logger.info(`Successfully upserted listing`, { listingId: listings[index].id });
          } else {
            logger.error(`Failed to upsert listing`, { listingId: listings[index].id, error: result.reason });
          }
        });
      } catch (error) {
        logger.error('An error occurred during the upsert process', { error });
      }

      overallResultCount += queryResultCount;
      resultCount = queryResultCount;
      offset += limit;

      // Random 2-3 wait to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 5000));
    } while (resultCount > 0 && offset < 1000);
  }

  logger.info(`Extraction complete`);
})();
