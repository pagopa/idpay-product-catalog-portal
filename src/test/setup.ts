import '@testing-library/jest-dom';

import { afterEach, beforeAll, vi } from 'vitest';

beforeAll(() => {
  vi.stubEnv('INITIATIVE_NAME', 'bonus_elettrodomestici');
});
import { cleanup } from '@testing-library/react';

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
