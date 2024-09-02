import { Flex, FlexProps } from '@chakra-ui/react';
import { User } from 'entities';
import React from 'react';
import { MemberCard } from 'widgets';

type IProps = FlexProps & {
  members: User[];
};

const MemberColumnFlex: React.FC<IProps> = ({
  members,
  ...props
}) => {
  return (
    <Flex direction='column' gap='4' {...props}>
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </Flex>
  )
}

export default MemberColumnFlex;