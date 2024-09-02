import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';
import { Loading } from 'widgets';

type IProps = BoxProps & {
  loading: boolean;
  children: React.ReactNode;
}

const Page: React.FC<IProps> = ({ 
  loading = false,
  children,
  ...props
}) => {
  return (
    <Box maxWidth="100%" paddingX="16" paddingY="8" {...props}>
      {loading ? <Loading /> : children}
    </Box>
  )
}

export default Page;