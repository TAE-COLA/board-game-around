import { Flex } from '@chakra-ui/react';
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { PageRouter } from 'pages';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';


const App: React.FC = () => {
  const background = "linear(to-br, blue.200, pink.200)";
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  return (
    <Flex flexDirection="column" width="100%" minHeight="100vh" overflowX="hidden" bgGradient={background}>
      <BrowserRouter>
        <PageRouter />
      </BrowserRouter>
    </Flex>
  );
}

export default App