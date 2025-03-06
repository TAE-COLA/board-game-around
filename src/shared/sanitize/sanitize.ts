/* eslint-disable @typescript-eslint/no-explicit-any */

export const sanitize = <T>(obj: T): T | null => {
  if (obj === undefined) throw new Error('Invalid data: data is undefined');

  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj
      .filter((item) => sanitize(item) !== null)
      .map((item) => sanitize(item)) as unknown as T;
  }

  if (obj && typeof obj === 'object' && 'placeholder' in obj) return null;

  const result = {} as T;
  for (const key in obj) {
    result[key] = sanitize((obj as any)[key]);
  }

  return result;
};

/*
예시 1
[입력] sanitize({ a: { placeholder: true }, b: { c: { placeholder: true } } })
[출력] { a: null, b: { c: null } }

예시 2
[입력] sanitize({ a: { b: [{ placeholder: true }] }, c: [1, 2, 3] })
[출력] { a: { b: [] }, c: [1, 2, 3] }

예시 3
[입력] sanitize({ a: 3, b: [1, 2, 3] })
[출력] { a: 3, b: [1, 2, 3] }

예시 4
[입력] sanitize({ a: 3, b: [1, 2, 3], c: { d: { placeholder: true }, e: [{ placeholder: true }] } })
[출력] { a: 3, b: [1, 2, 3], c: { d: null, e: [] } }

예시 5
[입력] sanitize(undefined)
[출력] undefined

예시 6
[입력] sanitize(null)
[출력] null

예시 7
[입력] sanitize(3)
[출력] 3
*/
