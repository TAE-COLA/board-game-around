import { Flex } from '@chakra-ui/react';
import { useYachtDiceIntent } from 'pages';
import React from 'react';
import { Page, YachtDiceBody, YachtDiceHeader } from 'widgets';

const YachtDicePage: React.FC = () => {
  const intent = useYachtDiceIntent();

  return (
    <Page loading={intent.loading} height='100vh'>
      <Flex direction='column' width='100%' height='100%' gap='8'>
        <YachtDiceHeader onClickExitButton={() => intent.onEvent({ type: 'ON_CLICK_EXIT_BUTTON' })} />
        <YachtDiceBody 
          players={intent.lounge.players}
          boards={intent.state.boards}
          turn={intent.state.turn}
          dice={intent.state.dice}
          keep={intent.state.keep}
          rolls={intent.state.rolls}
          rolling={intent.state.rolling}
          onClickRollButton={() => intent.onEvent({ type: 'ON_CLICK_ROLL_BUTTON' })}
          onRollFinish={(values) => intent.onEvent({ type: 'ON_ROLL_FINISH', values })}
          onAddDiceToKeep={(index) => intent.onEvent({ type: 'ON_ADD_DICE_TO_KEEP', index })}
          onRemoveDiceToKeep={(index) => intent.onEvent({ type: 'ON_REMOVE_DICE_TO_KEEP', index })}
          onClickSelectHandButton={(key, value) => intent.onEvent({ type: 'ON_CLICK_SELECT_HAND_BUTTON', key, value })}
          flex='1'
        />
      </Flex>
    </Page>
  );
}

export default YachtDicePage;