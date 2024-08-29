import { Text } from '@chakra-ui/react';
import { useRegisterIntent } from 'pages';
import React from 'react';
import { Page } from 'widgets';

const RegisterPage: React.FC = () => {
  const { state, onEvent } = useRegisterIntent();

  return (
    <Page>
      <Text>회원가입 페이지입니당</Text>
    </Page>
  );
};

export default RegisterPage;