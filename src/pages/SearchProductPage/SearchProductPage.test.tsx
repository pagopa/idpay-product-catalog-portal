import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SearchProductPage from './SearchProductPage';

vi.mock('../../components/ProductList/ProductList', () => ({
  default: ({ data }: { data: unknown[] }) => (
    <div data-testid="product-list">Loaded {data.length}</div>
  ),
}));

vi.mock('../../components/ProductsListSkeleton/ProductsListSkeleton', () => ({
  default: () => <div data-testid="skeleton" />,
}));

describe('SearchProductPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header texts', () => {
    render(<SearchProductPage />);

    expect(screen.getByText('Cerca un prodotto')).toBeInTheDocument();
    expect(
      screen.getByText(/Consulta la lista per verificare/)
    ).toBeInTheDocument();
  });

  it('shows skeleton while loading and then renders product list', async () => {
    const mockData = [{ id: 1 }, { id: 2 }];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockData),
    });

    render(<SearchProductPage />);

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('product-list')).toBeInTheDocument();
    });

    expect(screen.getByText('Loaded 2')).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    render(<SearchProductPage />);

    await waitFor(() => {
      expect(screen.getByTestId('product-list')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
  });
});
