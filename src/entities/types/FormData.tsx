export type FormData<Label extends string, Type> = {
  label: Label;
  value: Type;
  error: string | null;
}