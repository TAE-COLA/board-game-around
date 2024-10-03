export function getOrdinal(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];

  let suffix = suffixes[0];
  if (num % 100 >= 11 && num % 100 <= 13) {
    suffix = suffixes[0];
  } else {
    suffix = suffixes[num % 10] || suffixes[0];
  }

  return `${num}${suffix}`;
};