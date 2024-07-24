import { Brand } from '@/utils/brand';
import { Condition } from '@/logic/conditions/types';

export type OutcomeId = Brand<string, 'OutcomeId'>;

export interface OutcomeConfig {
  id: OutcomeId;
  name: string;
  enabled: boolean;
  successConditions: Condition[];
}
