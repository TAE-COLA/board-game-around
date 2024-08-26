import { Button, Flex, FormControl, FormLabel, Input } from '@chakra-ui/react';
import React from 'react';

const LoginFields: React.FC = () => {

  return (
    <Flex as="form" direction="column" width="full" maxWidth="md" bg="white" padding="8" borderRadius="md" boxShadow="md" gap="4" >
      <FormControl id="username">
        <FormLabel>Username</FormLabel>
        <Input type="text" placeholder="유저명을 입력하세요" />
      </FormControl>
      <FormControl id="password">
        <FormLabel>Password</FormLabel>
        <Input type="password" placeholder="비밀번호를 입력하세요" />
      </FormControl>
      <Button type="submit" colorScheme="blue" size="lg">로그인</Button>
    </Flex>
  );
}

export default LoginFields;