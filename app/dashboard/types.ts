import { Indicator } from '@/logic/indicators/types';
import { UserOutcome, UserTrigger } from '@/app/(logic)/types';

export interface Strategy {
  id: string;
  name: string;
  indicators: Indicator[];
  triggers: UserTrigger[];
  outcome: UserOutcome;
}
