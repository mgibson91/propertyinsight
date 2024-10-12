export function mapGarageStringToCount(inputString: string): number | null {
  switch (inputString) {
    case 'four':
    case 'quadruple':
      return 4;
    case 'triple':
      return 3;
    case 'double':
      return 2;
    case 'single':
    case 'detached':
    case 'attached':
    case 'integrated':
    case 'integral':
      return 1;
    case 'none':
      return 0;
    default:
      return null;
  }
}

interface mapToIntegerOptions {
  zeroToNull?: boolean;
}

export function mapToInteger(value: any, options?: mapToIntegerOptions): number | null {
  const zeroToNull = options?.zeroToNull ?? false;

  const result = parseInt(value);

  // Use the unary plus operator to convert the value to a number
  if (value === null || isNaN(result) || (zeroToNull && result === 0)) {
    return null;
  } else {
    return result;
  }
}

export function mapToBooleanValue(value: any): 1 | null {
  if (value === true) {
    return 1;
  } else {
    return null;
  }
}
