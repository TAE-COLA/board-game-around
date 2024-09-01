import { FormControl, FormErrorMessage, FormHelperText, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { FormData } from 'entities';
import React from 'react';


type IProps<Label extends string> = {
  id: string;
  data: FormData<Label, string>;
  onValueChange: (value: string) => void;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  helperText?: string;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  children?: React.ReactNode;
};

const FormInput = <Label extends string>({
  id,
  data,
  onValueChange,
  type = 'text',
  placeholder = '',
  helperText,
  isReadOnly = false,
  isDisabled = false,
  children
}: IProps<Label>) => {
  return (
    <FormControl id={id} isInvalid={data.error !== null}>
      <InputGroup>
        <Input
          type={type}
          placeholder={placeholder}
          value={data.value}
          onChange={(e) => onValueChange(e.target.value)}
          paddingRight='100'
          isReadOnly={isReadOnly}
          isDisabled={isDisabled}
        />
        <InputRightElement width='120'>
          {children}
        </InputRightElement>
      </InputGroup>
      {!data.error ? 
        <FormHelperText paddingX='2'>{helperText}</FormHelperText> :
        <FormErrorMessage paddingX='2'>{data.error}</FormErrorMessage>
      }
    </FormControl>
  );
};

export default FormInput;

type HTMLInputTypeAttribute =
  | "button"
  | "checkbox"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "hidden"
  | "image"
  | "month"
  | "number"
  | "password"
  | "radio"
  | "range"
  | "reset"
  | "search"
  | "submit"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week"
  | (string & {});