import * as z from 'zod';
import { ExtractedFieldsAiEstimationFirestoreStoreModel } from '@/repository/property-listings/ai-extraction/map-firestore-ai-extracted-fields-to-bigquery';

export type PropertyNewsStatus = 'For Sale' | 'Sale Agreed' | 'Under Offer' | 'For Rent' | 'Let Agreed';
export type PropertyNewsSector = 'Residential' | 'Commercial';
export type PropertyNewsCurrency = 'GBP' | 'EUR';
export type PropertyNewsPropertyType =
  | 'Apartment'
  | 'Cottage'
  | 'Detached'
  | 'Detached Bungalow'
  | 'End Terrace'
  | 'Flat'
  | 'Healthcare'
  | 'Land (Single Dwelling)'
  | 'Land (Multiple Dwelling)'
  | 'Semi-Detached'
  | 'Semi-Detached Bungalow'
  | 'Site'
  | 'Terrace'
  | 'Townhouse'
  | 'Villa';

export interface PropertyListing_PropertyNews {
  id: string;
  enrichedDetails?: {
    description?: string;
    epcRatingCurrent?: number;
    epcRatingPotential?: number;
    heatingType?: HeatingType_PropertyNews;
    tenure?: 'Freehold' | 'Leasehold' | 'Commonhold' | 'Shared Ownership';
  };
  aiEstimations?: ExtractedFieldsAiEstimationFirestoreStoreModel;
  propertyUrl: string;
  // There are no guaranteed address fields but should normally be enough to resolve
  address: {
    line1?: string;
    line2?: string;
    town?: string;
    postcode?: string;
  };
  leadImage?: {
    name?: string;
    sizes?: {
      size?: string;
      width?: string;
      height?: string;
      url?: string;
    }[];
  };
  promotedImages?: any[];
  imageCount?: number;
  price: number;
  currency: PropertyNewsCurrency;
  priceText?: string;
  status: PropertyNewsStatus;
  bedrooms: string; // 100% present in Bigquery (0 for sites)
  receptionRooms: number; // 100% present in Bigquery (0 for sites)
  propertyType: PropertyNewsPropertyType;
  propertyTypeLabel?: string;
  isNew: boolean; // Recently added
  isFeatured: boolean;
  isPromoted: boolean;
  addedTime: string;
  agents?: {
    id?: number;
    logo?: {
      name?: string;
      sizes?: {
        size?: string;
        width?: string;
        height?: string;
        url?: string;
      }[];
    };
    name?: string;
    phoneNumber?: string;
    featured?: boolean;
    companyInfo?: string;
    address?: {
      line1?: string;
      town?: string;
      county?: string;
      postcode?: string;
    };
    type?: string;
    url?: string;
  }[];
  location?: string;
  sector: PropertyNewsSector[];
  furnishing?: string; // Rental only
}

const heatingType_PropertyNews = z.enum([
  'OFCH',
  'Oil',
  'Gas',
  'Not Disclosed',
  'None',
  'GFCH',
  'Phoenix Gas',
  'Electric Heating',
  'Economy 7',
  'Dual',
  'Solid Fuel',
  'Solid fuel',
  'Underfloor',
  'Air Source Heat Pump',
  'Electric',
  'Dual (Solid & Oil)',
  'Exhaust Air Source Heat Pump',
  'Heat Pump System',
  'E7CH',
  'Oil Central',
  'Electric Under Floor',
  'Geothermal',
  'Wood Burning Pellets',
  'Ground Source Heat pump',
  'Air to Water heat pump',
  'GO Thermal',
]);

export type HeatingType_PropertyNews = z.infer<typeof heatingType_PropertyNews>;

export enum PropertyType {
  Apartment = 'apartment',
  Bungalow = 'bungalow',
  Detached = 'detached',
  SemiDetached = 'semi-detached',
  Terraced = 'terraced',
  Townhouse = 'townhouse',
  Villa = 'villa',
  Land = 'land',
  Cottage = 'cottage',
  Site = 'site',
  SpecialUse = 'special-use',
}

export function mapPropertyNewsTypeToPropertyType(propertyType: PropertyNewsPropertyType): PropertyType {
  switch (propertyType) {
    case 'Apartment':
    case 'Flat':
      return PropertyType.Apartment;
    case 'Detached Bungalow':
    case 'Semi-Detached Bungalow':
      return PropertyType.Bungalow;
    case 'Detached':
      return PropertyType.Detached;
    case 'Semi-Detached':
      return PropertyType.SemiDetached;
    case 'End Terrace':
    case 'Terrace':
      return PropertyType.Terraced;
    case 'Townhouse':
      return PropertyType.Townhouse;
    case 'Villa':
      return PropertyType.Villa;
    case 'Land (Single Dwelling)':
    case 'Land (Multiple Dwelling)':
      return PropertyType.Land;
    case 'Cottage':
      return PropertyType.Cottage;
    case 'Site':
      return PropertyType.Site;
    case 'Healthcare':
      return PropertyType.SpecialUse;
    default:
      throw new Error(`Unknown property type: ${propertyType}`);
  }
}
