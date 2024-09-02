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

export function createDummy<T extends object>(): T {
  const dummy = {} as T;

  for (const key in dummy) {
    (dummy as any)[key] = (undefined as unknown) as DefaultValue<T[typeof key]>;
  }

  return dummy;
}