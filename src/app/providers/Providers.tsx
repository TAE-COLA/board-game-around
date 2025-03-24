import { ChakraBaseProvider } from '@chakra-ui/react';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryClient, QueryClientProvider } from 'react-query';
import { customTheme } from './theme';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraBaseProvider theme={customTheme}>
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      </ChakraBaseProvider>
    </QueryClientProvider>
  );
};
