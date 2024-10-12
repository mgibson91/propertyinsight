import { mapGarageStringToCount, mapToBooleanValue, mapToInteger } from './property-news-mappers';

export interface ExtractedFieldsAiEstimationFirestoreStoreModel {
  bathroomCount: any;
  cloakroomCount: any;
  conservatoryCount: any;
  fireplaceCount: any;
  garageType: any;
  gardenSize: any;
  hasAnnex: any;
  hasCinema: any;
  hasJacuzzi: any;
  hasLoftSpace: any;
  hasPool: any;
  hasSauna: any;
  hasSolarPanels: any;
  hasSoundSystem: any;
  hasStables: any;
  hasTennisCourt: any;
  hasUnderfloorHeating: any;
  hasViews: any;
  hasWineCellar: any;
  isElevated: any;
  isPrivate: any;
  shedCount: any;
  utilityRoomCount: any;
}

export interface ExtractedFieldsBigQueryStoreModel {
  property_listing_id: string;
  bathroom_count: number | null;
  cloakroom_count: number | null; // Remove 0
  conservatory_count: number | null; // Remove 0
  fireplace_count: number | null;
  garage_count: number | null;
  garden_size: 'small' | 'medium' | 'large' | null;
  has_annex: 1 | null;
  has_cinema: 1 | null;
  has_jacuzzi: 1 | null;
  has_loft_space: 1 | null;
  has_pool: 1 | null;
  has_sauna: 1 | null;
  has_solar_panels: 1 | null;
  has_sound_system: 1 | null;
  has_stables: 1 | null;
  has_tennis_court: 1 | null;
  has_underfloor_heating: 1 | null;
  has_views: 1 | null;
  has_wine_cellar: 1 | null;
  is_elevated: 1 | null;
  is_private: 1 | null;
  shed_count: number | null;
  utility_room_count: number | null;
}

export function mapAiExtractedFieldsFromFirestoreToBigQuery(
  propertyListingId: string,
  firestoreModel: ExtractedFieldsAiEstimationFirestoreStoreModel
): ExtractedFieldsBigQueryStoreModel {
  const {
    bathroomCount,
    cloakroomCount,
    conservatoryCount,
    fireplaceCount,
    garageType,
    gardenSize,
    hasAnnex,
    hasCinema,
    hasJacuzzi,
    hasLoftSpace,
    hasPool,
    hasSauna,
    hasSolarPanels,
    hasSoundSystem,
    hasStables,
    hasTennisCourt,
    hasUnderfloorHeating,
    hasViews,
    hasWineCellar,
    isElevated,
    isPrivate,
    shedCount,
    utilityRoomCount,
  } = firestoreModel;

  return {
    property_listing_id: propertyListingId,
    bathroom_count: mapToInteger(bathroomCount),
    cloakroom_count: mapToInteger(cloakroomCount, { zeroToNull: true }),
    conservatory_count: mapToInteger(conservatoryCount, { zeroToNull: true }),
    shed_count: mapToInteger(shedCount, { zeroToNull: true }),
    fireplace_count: mapToInteger(fireplaceCount),
    garage_count: mapGarageStringToCount(garageType),
    garden_size: ['small', 'medium', 'large'].includes(gardenSize) ? gardenSize : null,
    has_annex: mapToBooleanValue(hasAnnex),
    has_cinema: mapToBooleanValue(hasCinema),
    has_jacuzzi: mapToBooleanValue(hasJacuzzi),
    has_loft_space: mapToBooleanValue(hasLoftSpace),
    has_pool: mapToBooleanValue(hasPool),
    has_sauna: mapToBooleanValue(hasSauna),
    has_solar_panels: mapToBooleanValue(hasSolarPanels),
    has_sound_system: mapToBooleanValue(hasSoundSystem),
    has_stables: mapToBooleanValue(hasStables),
    has_tennis_court: mapToBooleanValue(hasTennisCourt),
    has_underfloor_heating: mapToBooleanValue(hasUnderfloorHeating),
    has_views: mapToBooleanValue(hasViews),
    has_wine_cellar: mapToBooleanValue(hasWineCellar),
    is_elevated: mapToBooleanValue(isElevated),
    is_private: mapToBooleanValue(isPrivate),
    utility_room_count: mapToInteger(utilityRoomCount),
  };
}
