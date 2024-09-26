import { Flex } from '@chakra-ui/react';
import { useLoungeContext } from 'features';
import { useYachtDiceIntent } from 'pages';
import React from 'react';
import { Page, YachtDiceBody, YachtDiceHeader, YachtDiceResultModal } from 'widgets';

const YachtDicePage: React.FC = () => {
  const { state, loading, modal, onEvent } = useYachtDiceIntent();
  const lounge = useLoungeContext();

  return (
    <Page loading={loading} height='100vh'>
      <Flex direction='column' width='100%' height='100%' gap='8'>
        <YachtDiceHeader onClickExitButton={() => onEvent({ type: 'ON_CLICK_EXIT_BUTTON' })} />
        <YachtDiceBody
          players={state.players}
          round={state.round}
          boards={state.boards}
          turn={state.turn}
          dice={state.dice}
          kept={state.kept}
          keep={state.keep}
          rolls={state.rolls}
          rolling={state.rolling}
          onClickRollButton={() => onEvent({ type: 'ON_CLICK_ROLL_BUTTON' })}
          onRollFinish={(values) => onEvent({ type: 'ON_ROLL_FINISH', values })}
          onAddDiceToKeep={(index) => onEvent({ type: 'ON_ADD_DICE_TO_KEEP', index })}
          onRemoveDiceToKeep={(index) => onEvent({ type: 'ON_REMOVE_DICE_TO_KEEP', index })}
          onClickSelectHandButton={(key, value) => onEvent({ type: 'ON_CLICK_SELECT_HAND_BUTTON', key, value })}
          flex='1'
        />
        <YachtDiceResultModal
          rank={lounge.players.map((player) => ({ player, score: 0 }))}
          modal={modal}
        />
      </Flex>
    </Page>
  );
}

export default YachtDicePage;