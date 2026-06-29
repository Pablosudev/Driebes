import { describe, it, expect } from 'vitest';


export function sum(a: number, b: number): number {
  return a + b;
}


describe('sum', () => {
  it('suma dos números positivos', () => {
    expect(sum(2, 3)).toBe(5);
  });
});
