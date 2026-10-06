import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Layout from './Layout';

vi.mock('../Header/Header', () => ({
  default: () => <div data-testid="header" />
}));

vi.mock('../Footer/Footer', () => ({
  Footer: () => <div data-testid="footer" />,
  default: () => <div data-testid="footer" />
}));

describe('Layout', () => {
  it('renders header, children and footer', () => {
    render(
      <Layout>
        <div data-testid="content">Page Content</div>
      </Layout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
