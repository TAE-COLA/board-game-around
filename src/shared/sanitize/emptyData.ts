export type EmptyData = {
  placeholder: boolean;
};

export const emptyData: EmptyData = { placeholder: true } as const;

export const isEmptyData = (obj: object) => obj && 'placeholder' in obj;
