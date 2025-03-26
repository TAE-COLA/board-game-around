import { Card, CardBody, CardProps, Divider, Flex, Spacer, Text } from '@chakra-ui/react';
import { useAuthContext } from 'app';
import { DavinciCodeTileColor, DavinciCodeTileModel, User } from 'models';
import React, { useCallback } from 'react';
import {
  Align,
  BorderStyle,
  BorderWidth,
  Colors,
  Cursor,
  Dimension,
  Direction,
  Size,
} from 'shared';

type Props = CardProps & {
  player: User;
  tile: DavinciCodeTileModel;
  size?: { width: number; height: number };
  onClick?: () => void;
};

export const DavinciCodeTile: React.FC<Props> = ({
  player,
  tile,
  size = { width: 54, height: 76 },
  onClick = () => {},
  ...props
}) => {
  const auth = useAuthContext();
  const isMyTile = auth.id === player.id;

  const handleClick = useCallback(() => {
    if (isMyTile || tile.isRevealed) return;
    onClick();
  }, [isMyTile, tile.isRevealed, onClick]);

  const border = {
    borderColor: tile.color === DavinciCodeTileColor.White ? Colors.Secondary : Colors.White,
    borderWidth: BorderWidth.Thin,
    borderStyle: BorderStyle.Solid,
  };
  const colors = {
    opacity: isMyTile && tile.isRevealed ? 0.3 : 1,
    cursor: isMyTile || tile.isRevealed ? Cursor.Default : Cursor.Pointer,
    text: tile.color === DavinciCodeTileColor.White ? Colors.Black : Colors.White,
  };

  return (
    <Card
      width={size.width}
      height={size.height}
      background={tile.color}
      opacity={colors.opacity}
      onClick={handleClick}
      cursor={colors.cursor}
      {...border}
      {...props}
    >
      <CardBody width={Dimension.Full} height={Dimension.Full}>
        <Flex
          direction={Direction.Column}
          height={Dimension.Full}
          align={Align.Center}
          justify={Align.Center}
        >
          <Text fontSize={Size.Xl} color={colors.text}>
            {isMyTile || tile.isRevealed ? tile.value : '?'}
          </Text>
          <Spacer />
          {(isMyTile || tile.isRevealed) && <Divider borderColor={Colors.Secondary} />}
        </Flex>
      </CardBody>
    </Card>
  );
};
