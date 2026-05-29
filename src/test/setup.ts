import '@testing-library/jest-dom';

import { afterEach, beforeAll, vi } from 'vitest';

beforeAll(() => {
  // Many components rely on getInitiativeConfig() which reads INITIATIVE_NAME.
  // In unit tests we set a default initiative to avoid "No initiative configuration found".
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
