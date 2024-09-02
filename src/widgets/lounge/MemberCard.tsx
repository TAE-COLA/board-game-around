import { Card, CardBody, CardProps, Text } from '@chakra-ui/react';
import { User } from 'entities';
import React from 'react';

type IProps = CardProps & {
  member: User;
};

const MemberCard: React.FC<IProps> = ({
  member,
  ...props
}) => {
  return (
    <Card {...props}>
      <CardBody>
        <Text>{member.name}</Text>
      </CardBody>
    </Card>
  )
}

export default MemberCard;