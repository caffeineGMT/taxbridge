// This file intentionally contains a TypeScript error to test the pre-commit hook

export function testFunction() {
  const x: number = "this is a string, not a number"; // TypeScript error!
  return x;
}
