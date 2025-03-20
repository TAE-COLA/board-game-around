/* eslint-disable @typescript-eslint/no-explicit-any */
import * as db from 'firebase/database';
import { CommonError, isPlaceholder } from 'shared';

export class FModel<T> {
  protected data: any;

  constructor(snapshot: db.DataSnapshot) {
    if (snapshot.key) {
      this.data = { ...snapshot.val(), id: snapshot.key };
    } else {
      this.data = snapshot.val();
    }
  }

  sanitize(onError?: () => never): T {
    return this._sanitize(this.data, onError) as T;
  }

  private _sanitize(data: any, onError?: () => never): any {
    if (data === undefined) {
      if (onError) return onError();
      throw new Error(CommonError.SANITIZE_FAILED(typeof data));
    }
    if (data === null || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data
        .map((item) => this._sanitize(item, onError))
        .filter((item) => !isPlaceholder(item)) as T;
    }

    const sanitizedObject: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      const sanitizedValue = this._sanitize(value, onError);
      sanitizedObject[key] = isPlaceholder(sanitizedValue) ? null : sanitizedValue;
    });

    return sanitizedObject as T;
  }
}

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
