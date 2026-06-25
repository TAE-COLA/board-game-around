import { StarIcon } from '@chakra-ui/icons';
import { Card, CardBody, CardProps, Flex, Text } from '@chakra-ui/react';
import { User } from 'features/auth';
import React from 'react';

type IProps = CardProps & {
  player: User;
  isOwner?: boolean;
  isPlayerTurn?: boolean;
};

export const PlayerCard: React.FC<IProps> = ({ player, isOwner = false, isPlayerTurn = true, ...props }) => {
  return (
    <Card
      direction='row'
      align='center'
      size={isPlayerTurn ? 'md' : 'sm'}
      opacity={isPlayerTurn ? '1' : '0.5'}
      marginStart={{ base: 0, md: isPlayerTurn ? '0' : '4' }}
      minHeight={{ base: '64px', md: isPlayerTurn ? '72px' : '64px' }}
      {...props}
    >
      <CardBody
        width='100%'
        minWidth={0}
        paddingX={{ base: 4, md: 5 }}
        paddingY={{ base: 3, md: 4 }}
      >
        <Flex align='center' justify='center' gap={2} minWidth={0}>
          <Text noOfLines={1} minWidth={0} fontSize={{ base: 'md', md: 'lg' }}>
            {player.name}
          </Text>
          {isOwner && <StarIcon width={{ base: 4, md: 5 }} height={{ base: 4, md: 5 }} flexShrink={0} />}
        </Flex>
      </CardBody>
    </Card>
  );
};
