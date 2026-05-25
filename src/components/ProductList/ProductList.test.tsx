import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductList from './ProductList';

vi.mock('../../hooks/useIsMobile', () => ({
  useIsMobile: vi.fn()
}));

vi.mock('../ProductsFilter/ProductsFilter', () => ({
  default: () => <div data-testid="filters" />,
}));

vi.mock('../Paginator/CustomPaginator', () => ({
  default: () => <div data-testid="paginator" />,
}));

vi.mock('../ProductDetailsDrawer/ProductDetailsDrawer', () => ({
  ProductDetailsDrawer: () => <div data-testid="drawer-open" />,
}));

vi.mock('../DownloadCsvLink/DownloadCsvLink', () => ({
  default: () => <div data-testid="download-link" />,
}));

import { useIsMobile } from '../../hooks/useIsMobile';

describe('ProductList', () => {
  const mockData = [
    {
      gtin: '1',
      model: 'ModelA',
      category: 'OVENS',
      brand: 'BrandA',
      countryOfProduction: 'IT',
      eprelCode: '123',
      productGroup: 'group1'
    },
    {
      gtin: '2',
      model: 'ModelB',
      category: 'OVENS',
      brand: 'BrandB',
      countryOfProduction: 'IT'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mobile cards when isMobile is true', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<ProductList data={mockData} />);

    expect(screen.getByText('ModelA')).toBeInTheDocument();
    expect(screen.getByText('ModelB')).toBeInTheDocument();
  });

  it('renders desktop table when isMobile is false', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductList data={mockData} />);

    expect(screen.getByText('Categoria')).toBeInTheDocument();
    expect(screen.getByText('Marca')).toBeInTheDocument();
  });

  it('opens drawer when row action clicked (desktop)', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductList data={mockData} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);

    expect(screen.getByTestId('drawer-open')).toBeInTheDocument();
  });

  it('renders paginator and download link', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductList data={mockData} />);

    expect(screen.getByTestId('paginator')).toBeInTheDocument();
    expect(screen.getByTestId('download-link')).toBeInTheDocument();
  });
});
