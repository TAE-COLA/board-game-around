import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';

type IProps = BoxProps & {
  children: React.ReactNode;
}

const Page: React.FC<IProps> = ({ 
  children,
  ...props
}) => {
  return (
    <Box maxWidth="100%" paddingX="64px" paddingY="32px" {...props}>
      {children}
    </Box>
  )
}

export default Page;