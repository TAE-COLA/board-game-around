import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { useAuthContext } from 'app';
import { DavinciCodeTileModel, dummyDavinciCodeTile, User } from 'models';
import React, { useEffect } from 'react';
import { Align, BorderRadius, BorderStyle, Colors, Direction, Overflow, Size } from 'shared';
import { DavinciCodeTile } from 'widgets';

type Props = {
  hand: DavinciCodeTileModel[];
  drawableTiles: number;
  pendingTiles: DavinciCodeTileModel[];
  onClickDrawButton: (isWhite: boolean) => void;
  onSubmitHand: (hand: DavinciCodeTileModel[]) => void;
  modal: { isOpen: boolean; onOpen: () => void; onClose: () => void };
};

export const DavinciCodeDrawModal: React.FC<Props> = ({
  hand,
  drawableTiles,
  pendingTiles,
  onClickDrawButton,
  onSubmitHand,
  modal,
}) => {
  const { id: authId, name: authName } = useAuthContext();

  const [step, setStep] = React.useState<number>(0);
  const [selectedTileIndex, setSelectedTileIndex] = React.useState<number | null>(null);
  const [myHands, setMyHands] = React.useState<DavinciCodeTileModel[]>(hand);

  const handleSelectTile = (index: number) => {
    if (step === 0) return;

    if (selectedTileIndex === index) {
      setSelectedTileIndex(null);

      const newHands = myHands.filter((tile) => !tile.isJoker());
      setMyHands(newHands);
    } else {
      setSelectedTileIndex(index);

      let newHands = myHands.filter((tile) => !tile.isJoker());
      const selectedTile = pendingTiles[index];

      if (selectedTile.isJoker()) {
        newHands = newHands.reduce((acc, tile) => {
          acc.push(dummyDavinciCodeTile, tile);
          return acc;
        }, [] as DavinciCodeTileModel[]);
        newHands.push(dummyDavinciCodeTile);
      } else {
        for (let i = 0; i <= newHands.length; i++) {
          if (
            i === newHands.length ||
            (!newHands[i].isJoker() &&
              (parseInt(newHands[i].number) > parseInt(selectedTile.number) ||
                (parseInt(newHands[i].number) === parseInt(selectedTile.number) &&
                  newHands[i].isWhite &&
                  !selectedTile.isWhite)))
          ) {
            newHands.splice(i, 0, dummyDavinciCodeTile);
            break;
          }
        }
      }

      setMyHands(newHands);
    }
  };

  const handlePlaceTile = (index: number) => {
    if (selectedTileIndex === null) return;

    let newHands = [...myHands];
    const selectedTile = pendingTiles[selectedTileIndex];

    newHands[index] = selectedTile;
    newHands = newHands.filter((tile) => tile.number !== '');

    setMyHands(newHands);
    setSelectedTileIndex(null);
  };

  const handleSubmitButton = () => {
    onSubmitHand(myHands);
    setStep(0);
    setSelectedTileIndex(null);
    setMyHands(hand);
    modal.onClose();
  };

  const boxProps = (selected: boolean) =>
    selected
      ? {
          padding: 2,
          border: 2,
          borderRadius: BorderRadius.Lg,
          borderStyle: BorderStyle.Dashed,
          borderColor: Colors.Error,
        }
      : {
          padding: 2,
          border: 2,
          borderRadius: BorderRadius.Lg,
          borderStyle: BorderStyle.Dashed,
          borderColor: Colors.Secondary300,
        };

  useEffect(() => {
    setMyHands(hand);
  }, [hand]);

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={modal.onClose}
      isCentered
      closeOnOverlayClick={false}
      size={Size.Xl}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{step === 0 ? '타일을 뽑아주세요.' : '타일을 배치해주세요.'}</ModalHeader>
        <ModalBody>
          <Flex direction={Direction.Column} gap={4}>
            <Flex gap={4}>
              {Array.from({ length: drawableTiles }).map((_, index) => (
                <Box
                  key={index}
                  onClick={() => handleSelectTile(index)}
                  {...boxProps(selectedTileIndex === index)}
                >
                  {pendingTiles[index] ? (
                    <DavinciCodeTile
                      player={{ id: authId, name: authName } as User}
                      tile={pendingTiles[index]}
                      onClick={() => {}}
                    />
                  ) : (
                    <Box width={13} height={18} />
                  )}
                </Box>
              ))}
            </Flex>
            {step === 1 && (
              <Flex direction={Direction.Column} gap={4}>
                <Text>내 타일</Text>
                <Flex align={Align.Center} gap={4} overflowX={Overflow.Auto}>
                  {myHands.map((tile, index) =>
                    tile.number === '' ? (
                      <Box key={index} onClick={() => handlePlaceTile(index)} {...boxProps(false)}>
                        <Box key={index} width={13} height={18} />
                      </Box>
                    ) : (
                      <DavinciCodeTile
                        key={index}
                        player={{ id: authId, name: authName } as User}
                        tile={tile}
                        onClick={() => {}}
                      />
                    )
                  )}
                </Flex>
              </Flex>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter>
          {step === 0 ? (
            pendingTiles.length < drawableTiles ? (
              <Flex gap={4}>
                <Button variant='outline' onClick={() => onClickDrawButton(true)}>
                  흰 타일 뽑기
                </Button>
                <Button
                  colorScheme='blackAlpha'
                  background='black'
                  onClick={() => onClickDrawButton(false)}
                >
                  검은 타일 뽑기
                </Button>
              </Flex>
            ) : (
              <Button onClick={() => setStep(1)}>다음</Button>
            )
          ) : (
            <Button onClick={handleSubmitButton}>완료</Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
