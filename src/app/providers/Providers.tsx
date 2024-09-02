import { ChakraBaseProvider, theme as chakraTheme, extendBaseTheme } from '@chakra-ui/react';
import { AuthProvider } from 'app';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient();
  const theme = extendBaseTheme({
    components: chakraTheme.components,
  });

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