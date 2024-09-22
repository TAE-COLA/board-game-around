import { Flex } from '@chakra-ui/react';
import { useAuth, useLounge } from 'features';
import { useYachtDiceIntent } from 'pages';
import React from 'react';
import { Page, YachtDiceBody, YachtDiceHeader } from 'widgets';

const YachtDicePage: React.FC = () => {
  const { state, onEvent } = useYachtDiceIntent();
  const { user, loading: authLoading } = useAuth();
  const { loading: loungeLoading, exit,  ...lounge } = useLounge();

  return (
    <Page loading={state.loading} height='100vh'>
      <Flex direction='column' width='100%' height='100%' gap='8'>
        <YachtDiceHeader onClickExitButton={() => onEvent({ type: 'ON_CLICK_EXIT_BUTTON' })} />
        <YachtDiceBody 
          players={lounge.players}
          boards={state.boards}
          turn={state.turn}
          dice={state.dice}
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
      </Flex>
    </Page>
  );
}

export default YachtDicePage;