import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileProductCard from './MobileProductCard';

vi.mock('@pagopa/mui-italia', async () => {
  const actual = await vi.importActual<typeof import('@pagopa/mui-italia')>('@pagopa/mui-italia');
  return {
    ...actual,
    ButtonNaked: (props: { onClick?: () => void; children: React.ReactNode }) => (
      <button onClick={props.onClick}>{props.children}</button>
    ),
    theme: {
      palette: {
        text: { primary: '#000' }
      },
      typography: {
        fontWeightBold: 700,
        fontWeightMedium: 500
      }
    }
  };
});

vi.mock('../ProductList/ProductList', () => ({
  baseUrlEprel: 'https://eprel.example.com'
}));

describe('MobileProductCard', () => {
  const baseProduct = {
    category: 'Frigorifero',
    brand: 'MarcaX',
    model: 'ModelloY',
    gtin: '123456789',
    eprelCode: '999',
    productGroup: 'groupA',
    countryOfProduction: 'IT'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product fields correctly', () => {
    render(<MobileProductCard product={baseProduct} />);

    expect(screen.getByText('Frigorifero')).toBeInTheDocument();
    expect(screen.getByText('MarcaX')).toBeInTheDocument();
    expect(screen.getByText('ModelloY')).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
    expect(screen.getByText('999')).toBeInTheDocument();
  });

  it('opens EPREL link when eprelCode and productGroup exist', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(<MobileProductCard product={baseProduct} />);

    fireEvent.click(screen.getByText('999'));

    expect(openSpy).toHaveBeenCalledWith(
      'https://eprel.example.com/groupA/999',
      '_blank'
    );
  });

  it('does not open EPREL link when missing data', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <MobileProductCard
        product={{
          ...baseProduct,
          eprelCode: undefined,
          productGroup: undefined
        }}
      />
    );

    fireEvent.click(screen.getByText('-'));

    expect(openSpy).not.toHaveBeenCalled();
  });

  it('calls onClick when "Vedi dettaglio" is clicked', () => {
    const onClick = vi.fn();

    render(<MobileProductCard product={baseProduct} onClick={onClick} />);

    fireEvent.click(screen.getByText('Vedi dettaglio'));

    expect(onClick).toHaveBeenCalled();
  });
});
