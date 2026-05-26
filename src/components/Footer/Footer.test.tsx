import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Footer } from './Footer';

vi.mock('../IOFeaturesBanner/IOFeaturesBanner', () => ({
  IOFeaturesBanner: () => <div data-testid="io-features-banner" />
}));

vi.mock('../BonusPARIInfo/BonusPARIInfo', () => ({
  BonusPariInfo: () => <div data-testid="bonus-pari-info" />
}));

vi.mock('../IOBanner/IOBanner', () => ({
  IOBanner: () => <div data-testid="io-banner" />
}));

vi.mock('@pagopa/mui-italia', () => ({
  FooterPostLogin: (props: {
    companyLink: { onClick: () => void };
    links: { label: string; onClick: () => void }[];
    onLanguageChanged: () => void;
  }) => (
    <div data-testid="footer-post-login">
      <button type="button" onClick={props.companyLink.onClick}>Company</button>
      {props.links.map((link) => (
        <button type="button" key={link.label} onClick={link.onClick}>
          {link.label}
        </button>
      ))}
      <button type="button" onClick={props.onLanguageChanged}>Language</button>
    </div>
  ),
  FooterLegal: (props: { content: React.ReactNode }) => (
    <div data-testid="footer-legal">{props.content}</div>
  )
}));

describe('Footer component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all child sections', () => {
    render(<Footer />);

    expect(screen.getByTestId('io-features-banner')).toBeInTheDocument();
    expect(screen.getByTestId('bonus-pari-info')).toBeInTheDocument();
    expect(screen.getByTestId('io-banner')).toBeInTheDocument();
    expect(screen.getByTestId('footer-post-login')).toBeInTheDocument();
    expect(screen.getByTestId('footer-legal')).toBeInTheDocument();
  });

  it('opens external links when clicked', () => {
    const focus = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockReturnValue({
      focus
    } as unknown as Window);

    render(<Footer />);

    fireEvent.click(screen.getByRole('button', { name: 'Company' }));
    fireEvent.click(screen.getByRole('button', { name: 'Informativa Privacy' }));
    fireEvent.click(screen.getByRole('button', { name: 'Diritto alla protezione dei dati personali' }));
    fireEvent.click(screen.getByRole('button', { name: "Termini e condizioni d'uso" }));
    fireEvent.click(screen.getByRole('button', { name: 'Accessibilità' }));
    fireEvent.click(screen.getByRole('button', { name: 'Language' }));

    expect(openSpy).toHaveBeenCalledTimes(5);
    expect(focus).toHaveBeenCalledTimes(5);
  });

  it('renders legal content text', () => {
    render(<Footer />);

    expect(screen.getByText(/PagoPA S\.p\.A\./i)).toBeInTheDocument();
  });
});
