import { Badge, Flex, FlexProps } from '@chakra-ui/react';
import { GameMetadata } from 'models';
import React from 'react';

type IProps = FlexProps & {
  metadata?: GameMetadata;
};

export const GameMetadataTags: React.FC<IProps> = ({ metadata, ...props }) => {
  if (!metadata) return null;

  const hasPlayerRange =
    typeof metadata.minPlayers === 'number' && typeof metadata.maxPlayers === 'number';
  const playerLabel = hasPlayerRange
    ? metadata.minPlayers === metadata.maxPlayers
      ? `${metadata.minPlayers}명`
      : `${metadata.minPlayers}~${metadata.maxPlayers}명`
    : null;
  const labels = [
    playerLabel,
    metadata.playMode,
    metadata.gameType,
    typeof metadata.averagePlayTimeMinutes === 'number'
      ? `평균 ${metadata.averagePlayTimeMinutes}분`
      : null,
  ].filter(Boolean);

  return (
    <Flex gap={2} wrap='wrap' {...props}>
      {labels.map((label) => (
        <Badge
          key={label}
          paddingX={2}
          paddingY={1}
          borderRadius='md'
          colorScheme='pink'
          variant='subtle'
          textTransform='none'
          whiteSpace='nowrap'
        >
          {label}
        </Badge>
      ))}
    </Flex>
  );
};
