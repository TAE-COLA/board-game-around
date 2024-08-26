import { Button, Flex, FlexProps, FormControl, FormLabel, Input, Text } from '@chakra-ui/react';
import { useAuth } from 'app';
import React, { useState } from 'react';

const LoginFields: React.FC<FlexProps> = ({ ...props }) => {
  const { login } = useAuth();
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ error, setError ] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(email, password);
    try {
      await login(email, password);
    } catch (err) {
      setError('Login failed: ' + err);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Flex direction='column' width='full' maxWidth='md' padding='8' gap='4' bg='white' borderRadius='md' boxShadow='md' {...props}>
        <FormControl id="email">
          <FormLabel>Email</FormLabel>
          <Input type="email" placeholder="이메일을 입력하세요" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id="password">
          <FormLabel>Password</FormLabel>
          <Input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        <Button type="submit" colorScheme="blue" size="lg">로그인</Button>
        {error && <Text color='red.500'>{error}</Text>}
      </Flex>
    </form>
  );
}

export default LoginFields;