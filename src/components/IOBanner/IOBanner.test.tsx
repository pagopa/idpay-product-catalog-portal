import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IOBanner } from './IOBanner';

vi.mock('../../assets/PlayStore_Button.png', () => ({ default: 'google-play.png' }));
vi.mock('../../assets/AppStore_Button.png', () => ({ default: 'app-store.png' }));
vi.mock('../../assets/io-gradient-blu.png', () => ({ default: 'gradient.png' }));

vi.mock('../../hooks/useIsMobile', () => ({
  useIsMobile: vi.fn()
}));

import { useIsMobile } from '../../hooks/useIsMobile';

describe('IOBanner', () => {
  it('renders title and store links in desktop mode', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<IOBanner />);

    expect(screen.getByText('Scarica IO, è gratis')).toBeInTheDocument();
    expect(screen.getByAltText('Google Play')).toBeInTheDocument();
    expect(screen.getByAltText('App Store')).toBeInTheDocument();

    const googleLink = screen.getByAltText('Google Play').closest('a');
    const appleLink = screen.getByAltText('App Store').closest('a');

    expect(googleLink).toHaveAttribute(
      'href',
      'https://play.google.com/store/apps/details?id=it.pagopa.io.app'
    );
    expect(appleLink).toHaveAttribute(
      'href',
      'https://apps.apple.com/it/app/io/id1501681835'
    );
  });

  it('renders correctly in mobile mode', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<IOBanner />);

    expect(screen.getByText('Scarica IO, è gratis')).toBeInTheDocument();
    expect(screen.getByAltText('Google Play')).toBeInTheDocument();
    expect(screen.getByAltText('App Store')).toBeInTheDocument();
  });
});
