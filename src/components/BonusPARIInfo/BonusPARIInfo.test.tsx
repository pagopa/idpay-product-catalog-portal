import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BonusPariInfo } from './BonusPARIInfo';

vi.mock('../../assets/PARI.png', () => ({ default: 'pari.png' }));

vi.mock('../../config/initiativeResolver', () => ({
  getInitiativeConfig: () => ({
    copy: {
      realizationPrefix: 'Il Bonus Elettrodomestici è realizzato tramite',
    },
  }),
}));

vi.mock('@pagopa/mui-italia', async () => {
  const actual =
    await vi.importActual<typeof import('@pagopa/mui-italia')>('@pagopa/mui-italia');
  return {
    ...actual,
    theme: {
      palette: {
        primary: { contrastText: '#fff' },
        divider: '#ccc',
      },
    },
  };
});

describe('BonusPariInfo', () => {
  it('renders PARI logo and text', () => {
    render(<BonusPariInfo />);

    expect(
      screen.getByText(/Il Bonus Elettrodomestici è realizzato tramite/i)
    ).toBeInTheDocument();

    expect(screen.getByAltText('Logo PARI')).toBeInTheDocument();
  });

  it('renders PARI link with correct href', () => {
    render(<BonusPariInfo />);

    const link = screen.getByRole('link', { name: 'PARI' });

    expect(link).toHaveAttribute(
      'href',
      'https://developer.pagopa.it/pari/overview'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
  });

  it('renders descriptive paragraph', () => {
    render(<BonusPariInfo />);

    expect(
      screen.getByText(/è la piattaforma digitale che semplifica l’accesso/i)
    ).toBeInTheDocument();
  });
});
