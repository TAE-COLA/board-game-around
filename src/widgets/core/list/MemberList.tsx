import { Flex, FlexProps } from '@chakra-ui/react';
import { User } from 'entities';
import React from 'react';
import { MemberCard } from 'widgets';

type IProps = FlexProps & {
  members: User[];
  owner?: User;
};

const MemberList: React.FC<IProps> = ({
  members,
  owner,
  ...props
}) => {
  return (
    <Flex direction='column' gap='4' {...props}>
      {members.map((member) => (
        <MemberCard key={member.id} member={member} isOwner={owner && owner.id === member.id} />
      ))}
    </Flex>
  )
}

export default MemberList;