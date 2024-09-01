import { useLoungeIntent } from 'pages';
import React, { useEffect } from 'react';
import { Page } from 'widgets';

const LoungePage: React.FC = () => {
  const { state, onEvent } = useLoungeIntent();

  useEffect(() => {
    onEvent({ type: 'SCREEN_INITIALIZE' });
  });

  return (
    <Page>
      loungeId: {state.lounge?.id}
    </Page>
  )
}

export default LoungePage;