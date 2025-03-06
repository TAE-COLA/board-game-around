import { Flex } from '@chakra-ui/react';
import { useAuthContext } from 'features';
import React from 'react';
import {
  DavinciCodeBody,
  DavinciCodeFooter,
  DavinciCodeHeader,
  NumberModal,
  Page,
} from 'widgets';
import DavinciCodeDrawModal from 'widgets/core/modal/DavinciCodeDrawModal';
import { useDavinciCodeIntent } from './useDavinciCodeIntent';

const DavinciCodePage: React.FC = () => {
  const { id: authId } = useAuthContext();
  const { state, loading, modal, onEvent } = useDavinciCodeIntent();

  return (
    <Page loading={loading} height='100vh'>
      <Flex direction='column' width='100%' height='100%' gap='8'>
        <DavinciCodeHeader
          onClickExitButton={() => onEvent({ type: 'ON_CLICK_EXIT_BUTTON' })}
        />
        <DavinciCodeBody
          players={state.players}
          hands={state.hands}
          turn={state.turn}
          finishedPlayers={state.finishedPlayers}
          onClickTile={(player, index) =>
            onEvent({ type: 'ON_CLICK_TILE', player, index })
          }
          flex='1'
        />
        <DavinciCodeFooter hand={state.hands[authId]} />
      </Flex>
      <DavinciCodeDrawModal
        hand={state.hands[authId]}
        drawableTiles={4}
        pendingTiles={state.pendingTiles}
        onClickDrawButton={(isWhite) =>
          onEvent({ type: 'ON_CLICK_DRAW_BUTTON', isWhite })
        }
        onSubmitHand={(hand) => onEvent({ type: 'ON_SUBMIT_HAND', hand })}
        modal={modal.drawModal}
      />
      <NumberModal
        digits={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, '-']}
        maxDigits={1}
        onConfirm={() => {}}
        modal={modal.numberModal}
      />
    </Page>
  );
};

export default DavinciCodePage;
