import { TransformOperator, TransformType } from '@/components/triggers/edit-trigger';

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
  operator: string;
  fieldB: ConditionField;
  fieldBTransform?: FieldTransform;
}
