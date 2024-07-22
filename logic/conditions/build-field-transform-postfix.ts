import { FieldTransform } from '@/components/triggers/edit-trigger';

export function buildFieldTransformPostfix(transform: FieldTransform): string {
  const { operator, value, type } = transform;
  if (type === 'percent') {
    const multiplier = operator === '+' ? 1 + value / 100 : 1 - value / 100;
    return ` * ${multiplier.toFixed(2)}`;
  } else if (type === 'absolute') {
    return ` ${operator} ${value}`;
  } else {
    throw new Error('Unsupported transform type');
  }
}
