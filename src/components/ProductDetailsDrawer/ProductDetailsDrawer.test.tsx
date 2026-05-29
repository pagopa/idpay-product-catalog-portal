import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductDetailsDrawer } from './ProductDetailsDrawer';

// Component reads initiative-dependent config via getInitiativeConfig().
// In unit tests we mock it to avoid relying on process env (INITIATIVE_NAME).
vi.mock('../../config/initiativeResolver', () => ({
  getInitiativeConfig: () => ({
    detailFields: [
      { key: 'model', label: 'Modello' },
      { key: 'countryOfProduction', label: 'Paese di produzione', formatter: 'country' },
      { key: 'capacity', label: 'Capacità' },
      { key: 'productCode', label: 'Codice prodotto' },
    ],
    copy: {},
  }),
}));

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');
  return {
    ...actual,
    Drawer: (props: { children: React.ReactNode; onClose: () => void }) => (
      <div role="dialog">
        {props.children}
        <button type="button" onClick={props.onClose}>drawer-close-prop</button>
      </div>
    ),
    SwipeableDrawer: (props: {
      children: React.ReactNode;
      onClose: () => void;
      onOpen: () => void;
      disableBackdropTransition?: boolean;
      disableDiscovery?: boolean;
    }) => (
      <div
        role="dialog"
        data-disable-backdrop-transition={String(props.disableBackdropTransition)}
        data-disable-discovery={String(props.disableDiscovery)}
      >
        {props.children}
        <button type="button" onClick={props.onOpen}>swipe-open-prop</button>
        <button type="button" onClick={props.onClose}>swipe-close-prop</button>
      </div>
    )
  };
});

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
    const onOpen = vi.fn();

    render(
      <ProductDetailsDrawer
        open
        onClose={vi.fn()}
        onOpen={onOpen}
        product={mockProduct}
      />
    );

    expect(screen.getByText('Prodotto Test')).toBeInTheDocument();
    expect(screen.getByText('10kg')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'swipe-open-prop' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
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

  it('uses fallbacks for missing optional fields and unknown countries', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(
      <ProductDetailsDrawer
        open
        onClose={vi.fn()}
        product={{
          gtin: '999',
          model: 'FallbackModel',
          category: 'CategoriaY',
          brand: 'BrandY',
          countryOfProduction: 'US'
        }}
      />
    );

    expect(screen.getByText('FallbackModel')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();

    // With mocked initiativeConfig.detailFields, only missing fields among those are rendered as '-'
    // (capacity + productCode + headerTitle when productName is missing)
    expect(screen.getAllByText('-')).toHaveLength(3);
  });

  it('honors forceMode drawer on mobile', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(
      <ProductDetailsDrawer
        open
        forceMode="drawer"
        width={360}
        onClose={vi.fn()}
        product={mockProduct}
      />
    );

    expect(screen.getByText('Prodotto Test')).toBeInTheDocument();
    expect(screen.getByText('CODE123')).toBeInTheDocument();
  });

  it('honors forceMode swipeable on desktop without onOpen', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(
      <ProductDetailsDrawer
        open
        forceMode="swipeable"
        mobileHeight="60%"
        onClose={vi.fn()}
        product={mockProduct}
      />
    );

    expect(screen.getByText('Prodotto Test')).toBeInTheDocument();
    expect(screen.getByText('SCHEDA PRODOTTO')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'swipe-open-prop' }));
  });

  it('handles iOS specific swipeable props', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const originalNavigator = global.navigator;
    // @ts-expect-error override navigator for test
    global.navigator = { userAgent: 'iPhone' };

    render(
      <ProductDetailsDrawer
        open
        onClose={vi.fn()}
        product={mockProduct}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-disable-backdrop-transition', 'false');
    expect(dialog).toHaveAttribute('data-disable-discovery', 'true');

    global.navigator = originalNavigator;
  });
});
