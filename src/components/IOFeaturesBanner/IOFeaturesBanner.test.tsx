import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IOFeaturesBanner } from './IOFeaturesBanner';

vi.mock('../../assets/io-app.png', () => ({ default: 'phone.png' }));

vi.mock('../../hooks/useIsMobile', () => ({
  useIsMobile: vi.fn()
}));

vi.mock('@mui/system', async () => {
  const actual = await vi.importActual<typeof import('@mui/system')>('@mui/system');
  return {
    ...actual,
    useMediaQuery: vi.fn()
  };
});

import { useIsMobile } from '../../hooks/useIsMobile';
import { useMediaQuery } from '@mui/system';

describe('IOFeaturesBanner', () => {
  it('renders mobile layout when isMobile is true', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<IOFeaturesBanner />);

    expect(screen.getByText('Scopri le funzionalità di IO')).toBeInTheDocument();
    expect(screen.getByText(/Con IO ricevi comunicazioni/)).toBeInTheDocument();

    const button = screen.getByRole('link', { name: 'Scopri di più' });
    expect(button).toHaveAttribute('href', 'https://io.italia.it');
  });

  it('renders desktop layout when isMobile is false', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (useMediaQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<IOFeaturesBanner />);

    expect(screen.getByText('Scopri le funzionalità di IO')).toBeInTheDocument();
    expect(screen.getByAltText('Anteprima App IO')).toBeInTheDocument();

    const button = screen.getByRole('link', { name: 'Scopri di più' });
    expect(button).toHaveAttribute('href', 'https://io.italia.it');
  });

  it('handles tablet layout (useMediaQuery true)', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (useMediaQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<IOFeaturesBanner />);

    expect(screen.getByAltText('Anteprima App IO')).toBeInTheDocument();
  });
});
