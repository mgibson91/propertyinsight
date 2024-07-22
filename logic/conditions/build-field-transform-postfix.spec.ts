import { FieldTransform } from '@/components/triggers/edit-trigger';
import { buildFieldTransformPostfix } from './build-field-transform-postfix';

describe('buildFieldTransformPostfix', () => {
  test('should return "* 1.02" for + 2% transform', () => {
    const transform: FieldTransform = { operator: '+', value: 2, type: 'percent' };
    expect(buildFieldTransformPostfix(transform)).toBe('* 1.02');
  });

  test('should return "* 0.98" for - 2% transform', () => {
    const transform: FieldTransform = { operator: '-', value: 2, type: 'percent' };
    expect(buildFieldTransformPostfix(transform)).toBe('* 0.98');
  });

  test('should return "+ 500" for + 500 absolute transform', () => {
    const transform: FieldTransform = { operator: '+', value: 500, type: 'absolute' };
    expect(buildFieldTransformPostfix(transform)).toBe('+ 500');
  });

  test('should return "- 500" for - 500 absolute transform', () => {
    const transform: FieldTransform = { operator: '-', value: 500, type: 'absolute' };
    expect(buildFieldTransformPostfix(transform)).toBe('- 500');
  });
});
