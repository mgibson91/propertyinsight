export function crossunder(a: number[], b: number[]): boolean {
  if (!a?.length || !b?.length) {
    return false;
  }

  return a[0] < b[0] && a[1] > b[1];
}
