import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ProductsListSkeleton from './ProductsListSkeleton';

vi.mock('../../hooks/useIsMobile', () => ({
  useIsMobile: vi.fn()
}));

import { useIsMobile } from '../../hooks/useIsMobile';

describe('ProductsListSkeleton', () => {
  it('renders mobile layout when isMobile is true', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<ProductsListSkeleton />);

    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders desktop layout when isMobile is false', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductsListSkeleton />);

    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders bottom pagination skeleton', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductsListSkeleton />);

    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
