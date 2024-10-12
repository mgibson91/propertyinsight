import { mapGarageStringToCount, mapToInteger } from './property-news-mappers';

describe('mapStringToNumber', () => {
  test.each([
    ['four', 4],
    ['quadruple', 4],
    ['triple', 3],
    ['double', 2],
    ['single', 1],
    ['detached', 1],
    ['attached', 1],
    ['integrated', 1],
    ['integral', 1],
    ['none', 0],
    ['large', null],
    ['oversized', null],
    ['TBC', null],
  ])('maps %p to %p', (input: string, expected: number | null) => {
    expect(mapGarageStringToCount(input)).toEqual(expected);
  });
});

describe('mapToInteger', () => {
  test.each([
    [null, null],
    [undefined, null],
    ['', null],
    ['hello', null],
    ['123', 123],
    ['3.14', 3],
    [42, 42],
    [Infinity, null],
  ])('maps %p to %p', (input: any, expected: number | null) => {
    expect(mapToInteger(input)).toEqual(expected);
  });

  test.each([
    [null, null],
    [undefined, null],
    ['', null],
    ['hello', null],
    ['0', null],
    [0, null],
    [0.0, null],
    [42, 42],
    [Infinity, null],
  ])('maps %p to %p with zeroToNull option', (input: any, expected: number | null) => {
    const options = { zeroToNull: true };
    expect(mapToInteger(input, options)).toEqual(expected);
  });
});
