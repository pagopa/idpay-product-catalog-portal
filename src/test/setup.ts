import '@testing-library/jest-dom';

import React from 'react';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

vi.mock('@pagopa/mui-italia', async () => {
  const { createTheme } = await vi.importActual<typeof import('@mui/material/styles')>(
    '@mui/material/styles'
  );

  return {
    theme: createTheme(),
    ButtonNaked: ({ children, onClick, ...props }: React.PropsWithChildren<{
      onClick?: () => void;
      [key: string]: unknown;
    }>) => React.createElement('button', { onClick, ...props }, children),
  };
});

afterEach(() => {
  cleanup();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false
  })
});
