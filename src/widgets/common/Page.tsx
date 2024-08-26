import { Box } from '@chakra-ui/react';
import React from 'react';

type IProps = {
  children: React.ReactNode;
}

const Page: React.FC<IProps> = ({ children }) => {
  return (
    <Box maxWidth="100%" paddingX="64px" paddingTop="32px">
      {children}
    </Box>
  )
}

export default Page;