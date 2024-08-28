import { Button, Flex, FlexProps, FormControl, FormLabel, Input, Text, useToast } from '@chakra-ui/react';
import { useAuth } from 'features';
import React, { useState } from 'react';

const LoginFields: React.FC<FlexProps> = ({ ...props }) => {
  const { login } = useAuth();
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ error, setError ] = useState<string | null>(null);
  const toast = useToast();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login(email, password);
      toast({ title: '로그인 완료', description: '로그인이 완료되었습니다.', status: 'success', duration: 9000, isClosable: true });
    } catch (err) {
      setError("로그인 에러: " + err);
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