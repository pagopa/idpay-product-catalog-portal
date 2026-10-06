import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

vi.mock('@pagopa/mui-italia', () => ({
  HeaderAccount: (props: { rootLink: { label: string }; onAssistanceClick?: () => void }) => (
    <div data-testid="header-account">
      <span>{props.rootLink.label}</span>
      <button onClick={props.onAssistanceClick}>Assistance</button>
    </div>
  )
}));

describe('Header component', () => {
  it('renders HeaderAccount with PagoPA link label', () => {
    render(<Header />);

    expect(screen.getByTestId('header-account')).toBeInTheDocument();
    expect(screen.getByText('PagoPA S.p.A.')).toBeInTheDocument();
  });

  it('calls onAssistanceClick when assistance button is clicked', () => {
    const onAssistanceClick = vi.fn();

    render(<Header onAssistanceClick={onAssistanceClick} />);

    const button = screen.getByRole('button', { name: /assistance/i });
    button.click();

    expect(onAssistanceClick).toHaveBeenCalledTimes(1);
  });

  it('does not fail if onAssistanceClick is not provided', () => {
    render(<Header />);

    const button = screen.getByRole('button', { name: /assistance/i });
    expect(() => button.click()).not.toThrow();
  });
});
