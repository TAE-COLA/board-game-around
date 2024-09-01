import { CheckIcon } from '@chakra-ui/icons';
import { Button, Flex, FlexProps } from '@chakra-ui/react';
import React from 'react';
import { FormData } from 'shared';
import { FormInput } from 'widgets';

type IProps = FlexProps & {
  email: FormData<'email', string>;
  emailDuplicate: boolean | null;
  password: FormData<'password', string>;
  passwordConfirm: FormData<'passwordConfrim', string>;
  nickname: FormData<'nickname', string>;
  valid: boolean;
  onEmailChange: (email: string) => void;
  onClickCheckForDuplicatesButton: () => void;
  onPasswordChange: (password: string) => void;
  onPasswordConfirmChange: (passwordConfirm: string) => void;
  onNicknameChange: (nickname: string) => void;
  onClickSubmitButton: () => void;
};

const RegisterFields: React.FC<IProps> = ({ 
  email,
  emailDuplicate,
  password,
  passwordConfirm,
  nickname,
  valid,
  onEmailChange,
  onClickCheckForDuplicatesButton,
  onPasswordChange,
  onPasswordConfirmChange,
  onNicknameChange,
  onClickSubmitButton,
  ...props 
}) => {
  return (
    <Flex direction='column' width='full' maxWidth='md' padding='8' gap='4' bg='white' borderRadius='md' boxShadow='md' {...props}>
      <FormInput
        id={email.label}
        data={email}
        onValueChange={(value) => onEmailChange(value)}
        type='email'
        placeholder='이메일'
        isReadOnly={emailDuplicate === false}
      >
        {emailDuplicate === false ? 
          <CheckIcon color='green.500' marginRight='4' /> : 
          <Button onClick={onClickCheckForDuplicatesButton} isDisabled={email.value.length === 0 || email.error !== null} size='sm' marginRight='1'>중복확인</Button>
        }
      </FormInput>
      <FormInput
        id={password.label}
        data={password}
        onValueChange={(value) => onPasswordChange(value)}
        type='password'
        placeholder='비밀번호'
        helperText='비밀번호는 8자 이상이어야 합니다.'
      />
      <FormInput
        id={passwordConfirm.label}
        data={passwordConfirm}
        onValueChange={(value) => onPasswordConfirmChange(value)}
        type='password'
        placeholder='비밀번호 확인'
      />
      <FormInput
        id={nickname.label}
        data={nickname}
        onValueChange={(value) => onNicknameChange(value)}
        placeholder='닉네임'
        helperText='닉네임은 2자 이상 10자 이하로 입력하세요.'
      />
      <Button onClick={onClickSubmitButton} isDisabled={!valid} size="lg">회원가입</Button>
    </Flex>
  );
}

export default RegisterFields;