import { ChakraBaseProvider, theme as chakraTheme, extendBaseTheme } from '@chakra-ui/react';
import { AuthProvider } from 'app';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryClient, QueryClientProvider } from 'react-query';

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient();
  const theme = extendBaseTheme({
    components: chakraTheme.components,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraBaseProvider theme={theme}>
        <DndProvider backend={HTML5Backend}>
          <AuthProvider>
            { children }
          </AuthProvider>
        </DndProvider>
      </ChakraBaseProvider>
    </QueryClientProvider>
  );
};

export default Providers;