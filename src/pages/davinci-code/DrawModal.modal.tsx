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
import { DavinciCodeTile as tileEntity, User } from 'models';
import React, { useEffect } from 'react';
import { DavinciCodeTile } from 'widgets';

type IProps = {
  hand: tileEntity[];
  drawableTiles: number;
  pendingTiles: tileEntity[];
  onClickDrawButton: (isWhite: boolean) => void;
  onSubmitHand: (hand: tileEntity[]) => void;
  modal: { isOpen: boolean; onOpen: () => void; onClose: () => void };
};

export const DavinciCodeDrawModal: React.FC<IProps> = ({
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
  const [myHands, setMyHands] = React.useState<tileEntity[]>(hand);

  const handleSelectTile = (index: number) => {
    if (step === 0) return;

    if (selectedTileIndex === index) {
      setSelectedTileIndex(null);

      const newHands = myHands.filter((tile) => tile.number !== '');
      setMyHands(newHands);
    } else {
      setSelectedTileIndex(index);

      let newHands = myHands.filter((tile) => tile.number !== '');
      const selectedTile = pendingTiles[index];

      const dummyTile = {
        isRevealed: false,
        number: '',
        isWhite: false,
      } as tileEntity;

      if (selectedTile.number === '-') {
        newHands = newHands.reduce((acc, tile) => {
          acc.push(dummyTile, tile);
          return acc;
        }, [] as tileEntity[]);
        newHands.push(dummyTile);
      } else {
        for (let i = 0; i <= newHands.length; i++) {
          if (
            i === newHands.length ||
            (newHands[i].number !== '-' &&
              (parseInt(newHands[i].number) > parseInt(selectedTile.number) ||
                (parseInt(newHands[i].number) === parseInt(selectedTile.number) &&
                  newHands[i].isWhite &&
                  !selectedTile.isWhite)))
          ) {
            newHands.splice(i, 0, dummyTile);
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
          borderRadius: 'lg',
          borderStyle: 'dashed',
          borderColor: 'red.300',
        }
      : {
          padding: 2,
          border: 2,
          borderRadius: 'lg',
          borderStyle: 'dashed',
          borderColor: 'gray.300',
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
                  {...boxProps(selectedTileIndex === index)}
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
                      <Box key={index} onClick={() => handlePlaceTile(index)} {...boxProps(false)}>
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
