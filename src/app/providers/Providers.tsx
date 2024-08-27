import { ChakraBaseProvider, theme as chakraTheme, extendBaseTheme } from '@chakra-ui/react';
import { AuthProvider } from 'features';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const theme = extendBaseTheme({
  components: chakraTheme.components,
});

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraBaseProvider theme={theme}>
        <AuthProvider>
          { children }
        </AuthProvider>
      </ChakraBaseProvider>
    </QueryClientProvider>
  );
};

export default Providers;