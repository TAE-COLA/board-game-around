/* eslint-disable @typescript-eslint/no-explicit-any */
type DefaultValue<T> = T extends string
  ? ''
  : T extends number
  ? 0
  : T extends boolean
  ? false
  : T extends any[]
  ? []
  : T extends object
  ? { [K in keyof T]: DefaultValue<T[K]> }
  : null;

const createDefaultValue = <T>(value: T): DefaultValue<T> => {
  if (typeof value === 'string') return '' as DefaultValue<T>;
  if (typeof value === 'number') return 0 as DefaultValue<T>;
  if (typeof value === 'boolean') return false as DefaultValue<T>;
  if (Array.isArray(value)) return [] as DefaultValue<T>;
  if (typeof value === 'object' && value !== null) {
    const obj: any = {};
    for (const key in value) {
      obj[key] = createDefaultValue((value as any)[key]);
    }
    return obj as DefaultValue<T>;
  }
  return null as DefaultValue<T>;
};

export const createDummy = <T extends object>(): T => {
  const dummy = {} as T;

  for (const key in dummy) {
    (dummy as any)[key] = createDefaultValue(undefined as unknown as T[typeof key]);
  }

  return dummy;
};
