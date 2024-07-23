import { TransformOperator, TransformType } from '@/components/triggers/edit-trigger';
import { DefaultOperatorType } from '@/logic/indicators/types';

export interface FieldTransform {
  operator: TransformOperator;
  value: number;
  type: TransformType;
}

export interface ConditionField {
  property: string;
  offset: number;
}

export interface Condition {
  fieldA: ConditionField;
  operator: {
    custom?: boolean;
    type: DefaultOperatorType;
  };
  fieldB: ConditionField;
  fieldBTransform?: FieldTransform;
}
