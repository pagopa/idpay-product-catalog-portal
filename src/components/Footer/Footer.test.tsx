import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  }) => (
    <div data-testid="footer-post-login">
      <button onClick={props.companyLink.onClick}>Company</button>
      {props.links.map((link) => (
        <button key={link.label} onClick={link.onClick}>
          {link.label}
        </button>
      ))}
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
    const openSpy = vi.spyOn(window, 'open').mockReturnValue({
      focus: vi.fn()
    } as unknown as Window);

    render(<Footer />);

    const companyButton = screen.getByRole('button', { name: 'Company' });
    companyButton.click();

    expect(openSpy).toHaveBeenCalled();
  });

  it('renders legal content text', () => {
    render(<Footer />);

    expect(screen.getByText(/PagoPA S\.p\.A\./i)).toBeInTheDocument();
  });
});
