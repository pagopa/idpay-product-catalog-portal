import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SearchProductPage from './SearchProductPage';

// Component reads initiative-dependent copy via getInitiativeConfig().
// In unit tests we mock it to avoid relying on process env (INITIATIVE_NAME).
vi.mock('../../config/initiativeResolver', async () => {
  const actual =
    await vi.importActual<typeof import('../../config/initiativeResolver')>(
      '../../config/initiativeResolver'
    );

  return {
    ...actual,
    getInitiativeConfig: () => ({
      copy: {
        searchPage: {
          title: 'Cerca un prodotto',
          description: 'Consulta la lista per verificare',
        },
      },
      tableColumns: [],
      detailFields: [],
    }),
  };
});

vi.mock('../../components/ProductList/ProductList', () => ({
  default: ({ data }: { data: unknown[] }) => (
    <div data-testid="product-list">Loaded {data.length}</div>
  ),
}));

vi.mock('../../components/ProductsListSkeleton/ProductsListSkeleton', () => ({
  default: () => <div data-testid="skeleton" />,
}));

vi.mock('../../services/products/productsRepository', () => ({
  getEligibleProducts: vi.fn(),
}));

import { getEligibleProducts } from '../../services/products/productsRepository';

describe('SearchProductPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // SearchProductPage uses `getEligibleProducts()` (not fetch directly)
    global.fetch = vi.fn();
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

    (getEligibleProducts as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockData
    );

    render(<SearchProductPage />);

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('product-list')).toHaveTextContent('Loaded 2');
    });
  });

  it('handles fetch error gracefully', async () => {
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    (getEligibleProducts as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('boom')
    );

    render(<SearchProductPage />);

    await waitFor(() => {
      // On error we still end loading and render the list with 0 products
      expect(screen.getByTestId('product-list')).toHaveTextContent('Loaded 0');
    });

    // logger.error ultimately writes to console.error
    expect(errorSpy).toHaveBeenCalled();
  });
});
