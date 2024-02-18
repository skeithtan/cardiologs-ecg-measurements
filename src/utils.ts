/**
 * Truncates the decimal places of a number.
 * @example 3.14159 -> 3.1
 * @param value
 */
export function limitToOneDecimal(value: number): number {
  return Math.round(value * 1e2) / 1e2;
}

export function tryParseDate(input?: string): Date | undefined {
  if (input == null) {
    return undefined;
  }

  const timestamp = Date.parse(input);
  if (isNaN(timestamp)) {
    return undefined;
  }

  return new Date(timestamp);
}