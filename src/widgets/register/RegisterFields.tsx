import { CheckIcon } from '@chakra-ui/icons';
import { Button, Flex, FlexProps, FormControl, FormErrorMessage, FormHelperText, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import React from 'react';
import { FormData } from 'shared';

type IProps = FlexProps & {
  email: FormData<'email', string>;
  emailDuplicate: boolean | null;
  password: FormData<'password', string>;
  passwordConfirm: FormData<'passwordConfrim', string>;
  nickname: FormData<'nickname', string>;
  birthday: FormData<'birthday', Date>;
  valid: boolean;
  onEmailChange: (email: string) => void;
  onClickCheckForDuplicatesButton: () => void;
  onPasswordChange: (password: string) => void;
  onPasswordConfirmChange: (passwordConfirm: string) => void;
  onNicknameChange: (nickname: string) => void;
  onBirthdayChange: (birthday: Date) => void;
  onClickSubmitButton: () => void;
};

const RegisterFields: React.FC<IProps> = ({ 
  email,
  emailDuplicate,
  password,
  passwordConfirm,
  nickname,
  birthday,
  valid,
  onEmailChange,
  onClickCheckForDuplicatesButton,
  onPasswordChange,
  onPasswordConfirmChange,
  onNicknameChange,
  onBirthdayChange,
  onClickSubmitButton,
  ...props 
}) => {
  return (
    <Flex direction='column' width='full' maxWidth='md' padding='8' gap='4' bg='white' borderRadius='md' boxShadow='md' {...props}>
      <FormControl id={email.label} isInvalid={email.error !== null}>
        <InputGroup>
          <Input
            type='email'
            placeholder='이메일'
            value={email.value}
            onChange={(e) => onEmailChange(e.target.value)}
            paddingRight='100'
          />
          <InputRightElement width='120'>
            {emailDuplicate === false ? 
              <CheckIcon color='green.500' marginRight='4' /> : 
              <Button onClick={onClickCheckForDuplicatesButton} isDisabled={email.value.length === 0 || email.error !== null} size='sm' marginRight='1'>중복확인</Button>
            }
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage paddingX='2'>{email.error}</FormErrorMessage>
      </FormControl>
      <FormControl id={password.label} isInvalid={password.error !== null}>
        <Input 
          type='password'
          placeholder="비밀번호" 
          value={password.value} 
          onChange={(e) => onPasswordChange(e.target.value)} 
        />
        {!password.error ? 
          <FormHelperText paddingX='2'>비밀번호는 8자 이상이어야 합니다.</FormHelperText> :
          <FormErrorMessage paddingX='2'>{password.error}</FormErrorMessage>
        }
      </FormControl>
      <FormControl id={passwordConfirm.label} isInvalid={passwordConfirm.error !== null}>
        <Input 
          type='password'
          placeholder="비밀번호 확인" 
          value={passwordConfirm.value} 
          onChange={(e) => onPasswordConfirmChange(e.target.value)} 
        />
        <FormErrorMessage paddingX='2'>{passwordConfirm.error}</FormErrorMessage>
      </FormControl>
      <FormControl id={nickname.label} isInvalid={nickname.error !== null}>
        <Input 
          type='text'
          placeholder="닉네임" 
          value={nickname.value} 
          onChange={(e) => onNicknameChange(e.target.value)} 
        />
        {!nickname.error ? 
          <FormHelperText paddingX='2'>닉네임은 2자 이상 10자 이하로 입력하세요.</FormHelperText> :
          <FormErrorMessage paddingX='2'>{nickname.error}</FormErrorMessage>
        }
      </FormControl>
      <Button onClick={onClickSubmitButton} isDisabled={!valid} size="lg">회원가입</Button>
    </Flex>
  );
}

export default RegisterFields;