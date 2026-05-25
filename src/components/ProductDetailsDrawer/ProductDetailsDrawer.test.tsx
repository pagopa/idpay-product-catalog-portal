import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductDetailsDrawer } from './ProductDetailsDrawer';

vi.mock('../../hooks/useIsMobile', () => ({
  useIsMobile: vi.fn()
}));

import { useIsMobile } from '../../hooks/useIsMobile';

describe('ProductDetailsDrawer', () => {
  const mockProduct = {
    gtin: '123',
    model: 'ModelX',
    category: 'CategoriaX',
    brand: 'BrandX',
    countryOfProduction: 'IT',
    energyClass: 'A',
    productName: 'Prodotto Test',
    productGroup: 'group1',
    capacity: '10kg',
    productCode: 'CODE123'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Drawer mode on desktop', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(
      <ProductDetailsDrawer
        open
        onClose={vi.fn()}
        product={mockProduct}
      />
    );

    expect(screen.getByText('Prodotto Test')).toBeInTheDocument();
    expect(screen.getByText('SCHEDA PRODOTTO')).toBeInTheDocument();
    expect(screen.getByText('ModelX')).toBeInTheDocument();
    expect(screen.getByText('Italia')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const onClose = vi.fn();

    render(
      <ProductDetailsDrawer
        open
        onClose={onClose}
        product={mockProduct}
      />
    );

    fireEvent.click(screen.getByLabelText('chiudi'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders SwipeableDrawer on mobile', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(
      <ProductDetailsDrawer
        open
        onClose={vi.fn()}
        onOpen={vi.fn()}
        product={mockProduct}
      />
    );

    expect(screen.getByText('Prodotto Test')).toBeInTheDocument();
    expect(screen.getByText('10kg')).toBeInTheDocument();
  });

  it('renders dash when product is null', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(
      <ProductDetailsDrawer
        open
        onClose={vi.fn()}
        product={null}
      />
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
