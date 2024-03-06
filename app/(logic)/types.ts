import { Indicator } from '@/logic/indicators/types';
import { LineData, UTCTimestamp } from 'lightweight-charts';

export interface UserSeries {
  name: string;
  // seriesFunction: (data: OhlcData[]) => LineData<UTCTimestamp>[];
  seriesFunctionString: string;
  overlay: boolean;
  color: string;
  lineWidth: 1 | 2 | 3 | 4;
}

export interface UserTrigger {
  id: string;
  name: string;
  triggerFunctionString: string;
  color: string;
  size: number;
}

export interface UserOutcome {
  id: string;
  name: string;
  outcomeFunctionString: string;
  color: string;
  size: number;
}

export interface UserSeriesData {
  name: string;
  overlay: boolean;
  data: LineData<UTCTimestamp>[];
  color: string;
  lineWidth: 1 | 2 | 3 | 4;
}

export interface GenericData {
  time: UTCTimestamp;
  [key: string]: number | object;
}

// OHLC + Generic
export interface EnrichedOhlcData extends GenericData {
  open: number;
  high: number;
  low: number;
  close: number;
}
