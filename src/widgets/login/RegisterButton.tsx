import { Text } from '@chakra-ui/react';
import React from 'react';

const RegisterButton: React.FC = () => {
  return (
    <Text fontSize="sm">
      계정이 없으신가요? <a href="/signup" style={{ color: 'blue' }}>여기를 클릭</a>해서 회원가입하세요.
    </Text>
  );
}

export default RegisterButton;