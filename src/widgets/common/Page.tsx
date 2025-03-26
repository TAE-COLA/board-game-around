import { Box, BoxProps, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';
import { Dimension } from 'shared';
import { Loading } from 'widgets';

type Props = BoxProps & {
  loading?: boolean;
  children: React.ReactNode;
};

export const Page: React.FC<Props> = ({ loading = false, children, ...props }) => {
  const paddingX = useBreakpointValue({ base: 4, md: 16 });
  const paddingY = useBreakpointValue({ base: 2, md: 8 });

  return (
    <Box maxWidth={Dimension.Full} paddingX={paddingX} paddingY={paddingY} {...props}>
      {loading ? <Loading /> : children}
    </Box>
  );
};
