import { Flex } from '@chakra-ui/react';
import { useYachtDiceIntent } from 'pages';
import React from 'react';
import { Page, YachtDiceBody, YachtDiceHeader } from 'widgets';

const YachtDicePage: React.FC = () => {
  const { state, onEvent } = useYachtDiceIntent();

  return (
    <Page loading={state.loading} height='100vh'>
      <Flex direction='column' width='100%' height='100%' gap='8'>
        <YachtDiceHeader onClickExitButton={() => onEvent({ type: 'ON_CLICK_EXIT_BUTTON' })} />
        <YachtDiceBody 
          players={state.players}
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

// YachtDice
// - "loungeId"
//   - players: ["player1 ID", "player2 ID", "player3 ID"]
//   - boards:
//     - "player1 ID":
//       - aces: null
//       - deuces: null
//       - threes: null
//       - fours: null
//       - fives: null
//       - sixes: null
//       - bonus: 0
//       - choice: null
//       - fourKind: null
//       - fullHouse: null
//       - smStraight: null
//       - lgStraight: null
//       - yacht: null
//     - "player2 ID":
//       - ...
//     - "player3 ID":
//       - ...
//   - scores
//     - "player1 ID": 2
//     - "player2 ID": 3
//     - "player3 ID": 4
//   - turn: "player1 ID"
//   - dice: [1, 2, 3, 4, 5]
//   - keep: [false, true, true, false, false]
//   - rolls: 2