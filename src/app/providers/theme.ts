import { extendTheme } from '@chakra-ui/react';

export const customTheme = extendTheme({
  colors: {
    brand: {
      50: '#ffe5e9',
      100: '#fbbdc4',
      200: '#f2949e',
      300: '#e66b78',
      400: '#da4353',
      500: '#b52a43', // 메인 컬러
      600: '#991f39',
      700: '#7d1630',
      800: '#610e26',
      900: '#46081c',
    },
  },
});
