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
import React from 'react';
import { DavinciCodeTile } from 'widgets/davinci_code';

type IProps = {
  hand: tileEntity[];
  drawableTiles: number;
  modal: { isOpen: boolean; onOpen: () => void; onClose: () => void };
};

const DavinciCodeDrawModal: React.FC<IProps> = ({
  hand,
  drawableTiles,
  modal,
}) => {
  const { id: authId, name: authName } = useAuthContext();

  const [step, setStep] = React.useState<number>(0);
  const [remainingTiles, setRemainingTiles] =
    React.useState<number>(drawableTiles);
  const [drawnTiles, setDrawnTiles] = React.useState<tileEntity[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = React.useState<
    number | null
  >(null);
  const [myHands, setMyHands] = React.useState<tileEntity[]>(hand);

  const handleDrawTile = (isWhite: boolean) => {
    // Simulate drawing a tile from the server
    const newTile: tileEntity = {
      isRevealed: false,
      number: Math.floor(Math.random() * 13) + 1,
      isWhite,
    };
    setDrawnTiles([...drawnTiles, newTile]);
    setRemainingTiles(remainingTiles - 1);
  };

  const handleSelectTile = (index: number) => {
    setSelectedTileIndex(index);
  };

  const handlePlaceTile = (index: number) => {
    if (selectedTileIndex !== null) {
      const newHands = [...myHands];
      newHands.splice(index, 0, drawnTiles[selectedTileIndex]);
      setMyHands(newHands);
      setDrawnTiles(drawnTiles.filter((_, i) => i !== selectedTileIndex));
      setSelectedTileIndex(null);
    }
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

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={modal.onClose}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {step === 0 ? '타일을 뽑아주세요.' : '타일을 배치해주세요.'}
        </ModalHeader>
        <ModalBody>
          <Flex direction='column' gap={4}>
            <Flex gap={4}>
              {Array.from({ length: drawableTiles }).map((_, index) => (
                <Box
                  key={index}
                  onClick={() => handleSelectTile(index)}
                  {...boxProps(selectedTileIndex === index)}
                >
                  {drawnTiles[index] ? (
                    <DavinciCodeTile
                      player={{ id: authId, name: authName } as User}
                      tile={drawnTiles[index]}
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
                <Text>내 손패</Text>
                <Flex gap={4}>
                  {myHands.map((tile, index) => (
                    <DavinciCodeTile
                      key={index}
                      player={{ id: authId, name: authName } as User}
                      tile={tile}
                      onClick={() => {}}
                      size={{ width: '54px', height: '76px' }}
                    />
                  ))}
                  {selectedTileIndex !== null &&
                    Array.from({ length: myHands.length + 1 }).map(
                      (_, index) => (
                        <Box
                          key={index}
                          {...boxProps(false)}
                          onClick={() => handlePlaceTile(index)}
                        >
                          <Box width='54px' height='72px' />
                        </Box>
                      )
                    )}
                </Flex>
              </Flex>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter>
          {step === 0 ? (
            remainingTiles > 0 ? (
              <Flex gap={4}>
                <Button variant='outline' onClick={() => handleDrawTile(true)}>
                  흰 타일 뽑기
                </Button>
                <Button
                  colorScheme='blackAlpha'
                  background='black'
                  onClick={() => handleDrawTile(false)}
                >
                  검은 타일 뽑기
                </Button>
              </Flex>
            ) : (
              <Button onClick={() => setStep(1)}>다음</Button>
            )
          ) : (
            <Button onClick={modal.onClose}>완료</Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DavinciCodeDrawModal;
