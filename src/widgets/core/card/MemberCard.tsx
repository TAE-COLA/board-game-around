import { StarIcon } from '@chakra-ui/icons';
import { Card, CardBody, CardProps, Text } from '@chakra-ui/react';
import { User } from 'entities';
import React from 'react';

type IProps = CardProps & {
  member: User;
  isOwner?: boolean;
};

const MemberCard: React.FC<IProps> = ({
  member,
  isOwner = false,
  ...props
}) => {
  return (
    <Card direction={{ base: 'column', sm: 'row' }} align='center' {...props}>
      <CardBody>
        <Text>{member.name}</Text>
      </CardBody>
      {isOwner && <StarIcon width='6' height='6' marginEnd='4' />}
    </Card>
  )
}

export default MemberCard;