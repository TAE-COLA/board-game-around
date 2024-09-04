import { useYachtDiceIntent } from 'pages';
import React from 'react';
import { Page } from 'widgets';

const YachtDicePage: React.FC = () => {
  const { state, onEvent } = useYachtDiceIntent();

  return (
    <Page loading={state.loading}>
      <h1>Yacht Dice</h1>
    </Page>
  );
}

export default YachtDicePage;