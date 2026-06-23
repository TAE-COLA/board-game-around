import { Button, Flex, FlexProps, FormControl, FormLabel, Input } from '@chakra-ui/react';
import React, { KeyboardEvent } from 'react';

type IProps = FlexProps & {
  loading: boolean;
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onClickLoginButton: () => void;
};

export const LoginFields: React.FC<IProps> = ({
  loading,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onClickLoginButton,
  ...props
}) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onClickLoginButton();
    }
  };

  return (
    <Flex
      direction='column'
      width='full'
      maxWidth='md'
      padding={{ base: 5, md: 8 }}
      gap={{ base: 3, md: 4 }}
      bg='white'
      borderRadius='md'
      boxShadow='md'
      {...props}
    >
      <FormControl id='email'>
        <FormLabel>Email</FormLabel>
        <Input
          type='email'
          placeholder='이메일을 입력하세요'
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </FormControl>
      <FormControl id='password'>
        <FormLabel>Password</FormLabel>
        <Input
          type='password'
          placeholder='비밀번호를 입력하세요'
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </FormControl>
      <Button
        onClick={onClickLoginButton}
        isDisabled={loading}
        colorScheme='blue'
        size={{ base: 'md', md: 'lg' }}
      >
        로그인
      </Button>
    </Flex>
  );
};
