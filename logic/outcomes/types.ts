import { Brand } from '@/utils/brand';

export interface OutcomeField {
  property: string;
  offset: number;
}

export interface OutcomeCondition {
  fieldA: OutcomeField;
  operator: string;
  fieldB: OutcomeField;
}

export type OutcomeId = Brand<string, 'OutcomeId'>;

export interface OutcomeConfig {
  id: OutcomeId;
  name: string;
  enabled: boolean;
  successConditions: OutcomeCondition[];
  failureConditions: OutcomeCondition[];
}
