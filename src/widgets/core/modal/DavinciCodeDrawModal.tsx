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
import { DavinciCodeTile as tileEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React, { useCallback, useEffect, useState } from 'react';
import { DavinciCodeTile } from 'widgets/davinci_code';

type IProps = {
  hand: tileEntity[];
  drawableTiles: number;
  pendingTiles: tileEntity[];
  onClickDrawButton: (isWhite: boolean) => void;
  onSubmitHand: (hand: tileEntity[]) => void;
  modal: { isOpen: boolean; onOpen: () => void; onClose: () => void };
};

const isBiggerThan: (tile: tileEntity, other: tileEntity) => boolean | null = (tile, other) => {
  if (tile.number === '-') return null;
  if (other.number === '-') return null;
  return tile.number > other.number || (tile.number === other.number && tile.isWhite);
};

const DavinciCodeDrawModal: React.FC<IProps> = ({
  hand,
  drawableTiles,
  pendingTiles,
  onClickDrawButton,
  onSubmitHand,
  modal,
}) => {
  const { id: authId, name: authName } = useAuthContext();

  const [step, setStep] = useState<number>(0);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [myHands, setMyHands] = useState<tileEntity[]>(hand);

  const handleSelectTile = useCallback(
    (index: number) => {
      if (step === 0) return;

      setSelectedTileIndex((prevIndex) => {
        if (prevIndex === index) {
          setMyHands((prevHands) => prevHands.filter((tile) => tile.number !== ''));
          return null;
        } else {
          const selectedTile = pendingTiles[index];
          const dummyTile = {
            isRevealed: false,
            number: '',
            isWhite: false,
          } as tileEntity;

          setMyHands((prevHands) => {
            const newHands = prevHands
              .filter((tile) => tile.number !== '')
              .reduce((acc, tile) => {
                acc.push(dummyTile, tile);
                return acc;
              }, [] as tileEntity[]);

            if (selectedTile.number === '-') {
              newHands.push(dummyTile);
            } else {
              // const availableIndexes: number[] = [];
              // const pendingIndexes: number[] = [];
              // newHands.forEach((tile, index) => {
              //   if (tile.number === dummyTile.number) {
              //     let isAvailable = true;
              //     if (index > 0) {
              //       const prevTile = newHands[index - 1];
              //       if (prevTile.number === '-' && !pendingIndexes.includes(index)) {
              //         pendingIndexes.push(index);
              //       } else if (isBiggerThan(prevTile, selectedTile)) {
              //         isAvailable = false;
              //       }
              //     }
              //     if (index < newHands.length - 1) {
              //       const nextTile = newHands[index + 1];
              //       if (nextTile.number === '-' && !pendingIndexes.includes(index)) {
              //         pendingIndexes.push(index);
              //       } else if (isBiggerThan(selectedTile, nextTile)) {
              //         isAvailable = false;
              //       }
              //     }
              //     if (isAvailable) {
              //       availableIndexes.push(index);
              //     }
              //   } else {
              //     if (pendingIndexes.length) {
              //       if (tile.number !== '-' && isBiggerThan(tile, selectedTile)) {
              //         pendingIndexes.forEach((pendingIndex) => {
              //           availableIndexes.push(pendingIndex);
              //         });
              //         pendingIndexes.splice(0, pendingIndexes.length);
              //       } else if (tile.number !== '-' && isBiggerThan(selectedTile, tile)) {
              //         pendingIndexes.splice(0, pendingIndexes.length);
              //       }
              //     }
              //   }
              // });
              // if (pendingIndexes.length) {
              //   pendingIndexes.forEach((pendingIndex) => {
              //     availableIndexes.push(pendingIndex);
              //   });
              // }
              // newHands = newHands
              //   .map((tile, index) => {
              //     if (availableIndexes.includes(index)) {
              //       return tile;
              //     }
              //     return null;
              //   })
              //   .filter((tile) => tile !== null) as tileEntity[];
            }
            return newHands;
          });
          return index;
        }
      });
    },
    [step, pendingTiles]
  );

  const handlePlaceTile = useCallback(
    (index: number) => {
      if (selectedTileIndex === null) return;

      setMyHands((prevHands) => {
        const newHands = [...prevHands];
        newHands[index] = pendingTiles[selectedTileIndex];
        return newHands.filter((tile) => tile.number !== '');
      });
      setSelectedTileIndex(null);
    },
    [selectedTileIndex, pendingTiles]
  );

  const handleSubmitButton = useCallback(() => {
    onSubmitHand(myHands);
    setStep(0);
    setSelectedTileIndex(null);
    setMyHands(hand);
    modal.onClose();
  }, [myHands, onSubmitHand, hand, modal]);

  useEffect(() => {
    setMyHands(hand);
  }, [hand]);

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={modal.onClose}
      isCentered
      closeOnOverlayClick={false}
      size='xl'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{step === 0 ? '타일을 뽑아주세요.' : '타일을 배치해주세요.'}</ModalHeader>
        <ModalBody>
          <Flex direction='column' gap={4}>
            <Flex gap={4}>
              {Array.from({ length: drawableTiles }).map((_, index) => (
                <Box
                  key={index}
                  onClick={() => handleSelectTile(index)}
                  padding={2}
                  border={2}
                  borderRadius='lg'
                  borderStyle='dashed'
                  borderColor={selectedTileIndex === index ? 'red.300' : 'gray.300'}
                >
                  {pendingTiles[index] ? (
                    <DavinciCodeTile
                      player={{ id: authId, name: authName } as User}
                      tile={pendingTiles[index]}
                      size={{ width: '54px', height: '76px' }}
                      onClick={() => {}}
                    />
                  ) : (
                    <Box width='54px' height='72px' />
                  )}
                </Box>
              ))}
            </Flex>
            {step === 1 && (
              <Flex direction='column' gap={4}>
                <Text>내 타일</Text>
                <Flex align='center' gap={4} overflowX='auto'>
                  {myHands.map((tile, index) =>
                    tile.number === '' ? (
                      <Box
                        key={index}
                        onClick={() => handlePlaceTile(index)}
                        padding={2}
                        border={2}
                        borderRadius='lg'
                        borderStyle='dashed'
                        borderColor='gray.300'
                      >
                        <Box key={index} width='54px' height='72px' />
                      </Box>
                    ) : (
                      <DavinciCodeTile
                        key={index}
                        player={{ id: authId, name: authName } as User}
                        tile={tile}
                        onClick={() => {}}
                        size={{ width: '54px', height: '76px' }}
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

export default DavinciCodeDrawModal;
