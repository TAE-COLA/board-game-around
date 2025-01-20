import React from 'react'
import { useDavinciCodeIntent } from './useDavinciCodeIntent'
import { useLoungeContext } from 'features';
import { Page } from 'widgets';

const DavinciCodePage: React.FC = () => {
  const { state, loading, modal, onEvent } = useDavinciCodeIntent();
  const lounge = useLoungeContext();

  return (
    <Page loading={loading} height='100vh'>
      안녕!
    </Page>
  )
}

export default DavinciCodePage;