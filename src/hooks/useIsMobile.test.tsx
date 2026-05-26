import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useIsMobile } from './useIsMobile';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(),
    useTheme: vi.fn()
  };
});

import { useMediaQuery, useTheme } from '@mui/material';

describe('useIsMobile', () => {
  const theme = createTheme();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when media query matches mobile breakpoint', () => {
    const themeSpy = useTheme as unknown as ReturnType<typeof vi.fn>;
    const mediaSpy = useMediaQuery as unknown as ReturnType<typeof vi.fn>;

    themeSpy.mockReturnValue(theme);
    mediaSpy.mockReturnValue(true);

    const { result } = renderHook(() => useIsMobile(), { wrapper });

    expect(result.current).toBe(true);
  });

  it('returns false when media query does not match mobile breakpoint', () => {
    const themeSpy = useTheme as unknown as ReturnType<typeof vi.fn>;
    const mediaSpy = useMediaQuery as unknown as ReturnType<typeof vi.fn>;

    themeSpy.mockReturnValue(theme);
    mediaSpy.mockReturnValue(false);

    const { result } = renderHook(() => useIsMobile(), { wrapper });

    expect(result.current).toBe(false);
  });

  it('calls useMediaQuery with the mobile breakpoint query', () => {
    const mediaSpy = useMediaQuery as unknown as ReturnType<typeof vi.fn>;
    const themeSpy = useTheme as unknown as ReturnType<typeof vi.fn>;

    themeSpy.mockReturnValue(theme);
    mediaSpy.mockReturnValue(false);

    renderHook(() => useIsMobile(), { wrapper });

    const expectedQuery = theme.breakpoints.down('sm');
    expect(mediaSpy).toHaveBeenCalledWith(expectedQuery);
  });

  it('uses theme from useTheme hook', () => {
    const customTheme = createTheme({
      breakpoints: {
        values: { xs: 0, sm: 500, md: 900, lg: 1200, xl: 1536 }
      }
    });

    const themeSpy = useTheme as unknown as ReturnType<typeof vi.fn>;
    const mediaSpy = useMediaQuery as unknown as ReturnType<typeof vi.fn>;

    themeSpy.mockReturnValue(customTheme);
    mediaSpy.mockReturnValue(true);

    const { result } = renderHook(() => useIsMobile(), { wrapper });

    expect(result.current).toBe(true);
    expect(mediaSpy).toHaveBeenCalledWith(customTheme.breakpoints.down('sm'));
  });
});
