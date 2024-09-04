import { Box, Flex, FlexProps } from '@chakra-ui/react';
import { User } from 'entities';
import React from 'react';
import { MemberList } from 'widgets';

type IProps = FlexProps & {
  members: User[];
};

const YachtDiceBody: React.FC<IProps> = ({
  members,
  ...props
}) => {
  return (
    <Flex width='100%' gap='8' {...props}>
      <Box height='100%' flex='3' />
      <Flex direction='column' flex='1'>
        <MemberList members={members} />
      </Flex>
    </Flex>
  )
};

export default YachtDiceBody;