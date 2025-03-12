/* eslint-disable @typescript-eslint/no-explicit-any */

import { errorSanitizeFailed } from 'shared/error';

class Sanitized<T> {
  constructor(private value: T | null) {}

  val(): T {
    if (this.value === undefined || this.value === null) throw new Error(errorSanitizeFailed(typeof this.value));
    return this.value;
  }

  invalid(callback: () => void): Sanitized<T> {
    if (this.value === null || this.value === undefined) {
      callback();
    }
    return this;
  }
}

export const sanitize = <T>(
  obj: T,
  errorCallback: () => void = () => {
    throw new Error(errorSanitizeFailed(typeof obj));
  }
): Sanitized<T> => {
  if (obj === undefined) return new Sanitized<T>(null).invalid(errorCallback);

  if (obj === null || typeof obj !== 'object') return new Sanitized(obj);

  if (Array.isArray(obj)) {
    const sanitizedArray = obj
      .filter((item) => sanitize(item, errorCallback).val() !== null)
      .map((item) => sanitize(item, errorCallback).val());
    return new Sanitized(sanitizedArray as unknown as T);
  }

  if (obj && typeof obj === 'object' && 'placeholder' in obj) return new Sanitized<T>(null);

  const result = {} as T;
  for (const key in obj) {
    const sanitizedValue = sanitize((obj as any)[key], errorCallback).val();
    if (sanitizedValue !== undefined) {
      result[key] = sanitizedValue;
    }
  }

  return new Sanitized(result);
};

/*
예시 1
[입력] sanitize({ a: { placeholder: true }, b: { c: { placeholder: true } } })
[출력] { a: null, b: { c: null } }
[참고] a, b는 모두 nullable한 필드임

예시 2
[입력] sanitize({ a: { b: [{ placeholder: true }] }, c: [1, 2, 3] })
[출력] { a: { b: [] }, c: [1, 2, 3] }
[참고] b는 nullable한 필드임

예시 3
[입력] sanitize({ a: 3, b: [1, 2, 3] })
[출력] { a: 3, b: [1, 2, 3] }

예시 4
[입력] sanitize({ a: 3, b: [1, 2, 3], c: { d: { placeholder: true }, e: [{ placeholder: true }] } })
[출력] { a: 3, b: [1, 2, 3], c: { d: null, e: [] } }
[참고] d는 nullable한 필드임

예시 5
[입력] sanitize(undefined, () => { throw new Error('Invalid data: data is undefined'); })
<에러 발생> "Invalid data: data is undefined"

예시 6
[입력] sanitize(null, () => { throw new Error('Invalid data: data is undefined'); })
[출력] null

예시 7
[입력] sanitize(3, () => { throw new Error('Invalid data: data is undefined'); })
[출력] 3
*/
