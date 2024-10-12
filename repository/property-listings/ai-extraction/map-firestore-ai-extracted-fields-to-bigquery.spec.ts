import {
  ExtractedFieldsAiEstimationFirestoreStoreModel,
  ExtractedFieldsBigQueryStoreModel,
  mapAiExtractedFieldsFromFirestoreToBigQuery,
} from './map-firestore-ai-extracted-fields-to-bigquery';

describe('mapFirestoreToBigQuery', () => {
  test('maps all fields correctly', () => {
    const firestoreModel: ExtractedFieldsAiEstimationFirestoreStoreModel = {
      bathroomCount: 2,
      cloakroomCount: 1,
      conservatoryCount: 0,
      fireplaceCount: 1,
      garageType: 'single',
      gardenSize: 'large',
      hasAnnex: true,
      hasCinema: true,
      hasJacuzzi: true,
      hasLoftSpace: true,
      hasPool: true,
      hasSauna: true,
      hasSolarPanels: true,
      hasSoundSystem: true,
      hasStables: true,
      hasTennisCourt: true,
      hasUnderfloorHeating: true,
      hasViews: true,
      hasWineCellar: true,
      isElevated: true,
      isPrivate: true,
      shedCount: 0,
      utilityRoomCount: 1,
    };

    const expectedBigQueryModel: ExtractedFieldsBigQueryStoreModel = {
      property_listing_id: '123',
      bathroom_count: 2,
      cloakroom_count: 1,
      conservatory_count: null,
      fireplace_count: 1,
      garage_count: 1,
      garden_size: 'large',
      has_annex: 1,
      has_cinema: 1,
      has_jacuzzi: 1,
      has_loft_space: 1,
      has_pool: 1,
      has_sauna: 1,
      has_solar_panels: 1,
      has_sound_system: 1,
      has_stables: 1,
      has_tennis_court: 1,
      has_underfloor_heating: 1,
      has_views: 1,
      has_wine_cellar: 1,
      is_elevated: 1,
      is_private: 1,
      shed_count: null,
      utility_room_count: 1,
    };

    const actualBigQueryModel = mapAiExtractedFieldsFromFirestoreToBigQuery('123', firestoreModel);

    expect(actualBigQueryModel).toEqual(expectedBigQueryModel);
  });

  test('handles null and 0 correctly', () => {
    const firestoreModel: ExtractedFieldsAiEstimationFirestoreStoreModel = {
      bathroomCount: null,
      cloakroomCount: 0, // Should return null
      conservatoryCount: 0, // Should return null
      fireplaceCount: null,
      garageType: null,
      gardenSize: null,
      hasAnnex: null,
      hasCinema: null,
      hasJacuzzi: null,
      hasLoftSpace: null,
      hasPool: null,
      hasSauna: null,
      hasSolarPanels: null,
      hasSoundSystem: null,
      hasStables: null,
      hasTennisCourt: null,
      hasUnderfloorHeating: null,
      hasViews: null,
      hasWineCellar: null,
      isElevated: null,
      isPrivate: null,
      shedCount: null,
      utilityRoomCount: null,
    };

    const expectedBigQueryModel: ExtractedFieldsBigQueryStoreModel = {
      property_listing_id: '123',
      bathroom_count: null,
      cloakroom_count: null,
      conservatory_count: null,
      fireplace_count: null,
      garage_count: null,
      garden_size: null,
      has_annex: null,
      has_cinema: null,
      has_jacuzzi: null,
      has_loft_space: null,
      has_pool: null,
      has_sauna: null,
      has_solar_panels: null,
      has_sound_system: null,
      has_stables: null,
      has_tennis_court: null,
      has_underfloor_heating: null,
      has_views: null,
      has_wine_cellar: null,
      is_elevated: null,
      is_private: null,
      shed_count: null,
      utility_room_count: null,
    };

    const actualBigQueryModel = mapAiExtractedFieldsFromFirestoreToBigQuery('123', firestoreModel);

    expect(actualBigQueryModel).toEqual(expectedBigQueryModel);
  });
});
