export function convertToCamelCase(input: string): string {
  const parts = input
    .split(/\b/g)
    .map((part) => part.toLowerCase())
    .filter((part) => /[A-Za-z0-9]/.test(part));

  const [first, ...rest] = parts.filter(Boolean);
  const mappedParts = [
    first,
    ...rest.map((part) => part[0].toUpperCase() + part.slice(1)),
  ];
  return mappedParts.join("");
}
