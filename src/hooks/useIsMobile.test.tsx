import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useIsMobile } from './useIsMobile';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn()
  };
});

import { useMediaQuery } from '@mui/material';

describe('useIsMobile', () => {
  const theme = createTheme();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when media query matches mobile breakpoint', () => {
    (useMediaQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const { result } = renderHook(() => useIsMobile(), { wrapper });

    expect(result.current).toBe(true);
  });

  it('returns false when media query does not match mobile breakpoint', () => {
    (useMediaQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const { result } = renderHook(() => useIsMobile(), { wrapper });

    expect(result.current).toBe(false);
  });
});
