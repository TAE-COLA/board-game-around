/* eslint-disable @typescript-eslint/no-explicit-any */

export type Placeholder = { placeholder: true };

export type Nullable<T> = T | Placeholder;

export const placeholder = { placeholder: true } as const;

export const isPlaceholder = (value: any): value is Placeholder => {
  return value && typeof value === 'object' && value.placeholder === true;
};
