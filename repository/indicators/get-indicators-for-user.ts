import { Indicator } from '@/logic/indicators/types';
import { PRESET_INDICATOR_BOLLINGER_BANDS } from '@/logic/indicators/preset-indicator';

export async function getIndicatorsForUser(): Promise<Indicator[]> {
  return [PRESET_INDICATOR_BOLLINGER_BANDS];
}
