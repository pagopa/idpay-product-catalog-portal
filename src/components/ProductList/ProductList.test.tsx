import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductList from './ProductList';

// Component reads initiative-dependent copy/config via getInitiativeConfig().
// In unit tests we mock it to avoid relying on process env (INITIATIVE_NAME).
vi.mock('../../config/initiativeResolver', () => ({
  getInitiativeConfig: () => ({
    // ProductList builds MUI table columns from this config
    tableColumns: [
      { key: 'category', label: 'Categoria', sortable: true },
      { key: 'brand', label: 'Marca', sortable: true },
      // Needed for EPREL link test (clickable cell)
      { key: 'eprelCode', label: 'EPREL', sortable: false, link: { type: 'eprel' } },
    ],
    copy: {},
  }),
}));

vi.mock('../../hooks/useIsMobile', () => ({
  useIsMobile: vi.fn()
}));

vi.mock('../ProductsFilter/ProductsFilter', () => ({
  default: (props: {
    setSearch: (value: string) => void;
    setSelectedCategory: (value: string | null) => void;
    setSelectedBrand: (value: string | null) => void;
    setSelectedClass: (value: string | null) => void;
    categories: string[];
    brands: string[];
    classes: string[];
    modelsOrGtins: string[];
  }) => (
    <div data-testid="filters">
      <button type="button" onClick={() => props.setSearch(' model a ')}>
        search-model
      </button>
      <button type="button" onClick={() => props.setSelectedCategory(props.categories[0])}>
        filter-category
      </button>
      <button type="button" onClick={() => props.setSelectedBrand(props.brands[1])}>
        filter-brand
      </button>
      <button type="button" onClick={() => props.setSelectedClass(props.classes[0])}>
        filter-class
      </button>
      <button type="button" onClick={() => props.setSearch(props.modelsOrGtins[0])}>
        search-model-option
      </button>
    </div>
  ),
}));

vi.mock('../Paginator/CustomPaginator', () => ({
  default: (props: {
    sortedData: unknown[];
    setPage: (page: number) => void;
    setRowsPerPage: (rows: number) => void;
  }) => (
    <div data-testid="paginator">
      <span data-testid="filtered-count">{props.sortedData.length}</span>
      <button type="button" onClick={() => props.setPage(2)}>
        page-two
      </button>
      <button type="button" onClick={() => props.setRowsPerPage(25)}>
        rows-25
      </button>
    </div>
  ),
}));

vi.mock('../ProductDetailsDrawer/ProductDetailsDrawer', () => ({
  ProductDetailsDrawer: (props: {
    open: boolean;
    onClose: () => void;
    product: { model?: string } | null;
  }) => (
    <div data-testid="drawer-open">
      <span>{props.open ? 'open' : 'closed'}</span>
      <span>{props.product?.model ?? 'no-product'}</span>
      <button type="button" onClick={props.onClose}>
        close-drawer
      </button>
    </div>
  ),
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
      productGroup: 'group1',
      energyClass: 'A++',
      productName: ' Product   A '
    },
    {
      gtin: '2',
      model: 'ModelB',
      category: 'OVENS',
      brand: 'BrandB',
      countryOfProduction: 'IT',
      energyClass: 'B'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  it('renders mobile cards when isMobile is true', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<ProductList data={mockData} />);

    // Mobile cards render the initiative-configured fields, not necessarily `model`
    expect(screen.getByText('BrandA')).toBeInTheDocument();
    expect(screen.getByText('BrandB')).toBeInTheDocument();
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

    // Click the last "row action" icon button (second row -> ModelB)
    const actionButtons = screen.getAllByTestId('ArrowForwardIosIcon');
    fireEvent.click(actionButtons[1]);

    expect(screen.getByTestId('drawer-open')).toBeInTheDocument();
    expect(screen.getByText('open')).toBeInTheDocument();
    expect(screen.getByText('ModelB')).toBeInTheDocument();
  });

  it('renders paginator and download link', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductList data={mockData} />);

    expect(screen.getByTestId('paginator')).toBeInTheDocument();
    expect(screen.getByTestId('download-link')).toBeInTheDocument();
  });

  it('filters by search, category, brand and class through filter callbacks', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductList data={mockData} />);

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');

    fireEvent.click(screen.getByText('search-model'));
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');

    // On desktop view, the table doesn't render "ModelA" because "model" is not a column.
    // Assert using the visible columns (e.g. brand/category).
    expect(screen.getByText('BrandA')).toBeInTheDocument();

    fireEvent.click(screen.getByText('filter-category'));
    fireEvent.click(screen.getByText('filter-class'));
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('filter-brand'));
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('0');
  });

  it('sorts columns, opens eprel links and closes the drawer', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(<ProductList data={mockData} />);

    fireEvent.click(screen.getByText('Marca'));
    fireEvent.click(screen.getByText('Marca'));
    fireEvent.click(screen.getByText('123'));

    expect(openSpy).toHaveBeenCalledWith(
      'https://eprel.ec.europa.eu/screen/product/group1/123',
      '_blank'
    );

    const actionButtons = screen.getAllByTestId('ArrowForwardIosIcon');
    fireEvent.click(actionButtons[0]);
    expect(screen.getByText('open')).toBeInTheDocument();
    fireEvent.click(screen.getByText('close-drawer'));
    expect(screen.getByText('closed')).toBeInTheDocument();
    expect(screen.getByText('no-product')).toBeInTheDocument();
  });

  it('updates pagination state through the paginator callbacks', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductList data={mockData} />);

    fireEvent.click(screen.getByText('page-two'));
    fireEvent.click(screen.getByText('rows-25'));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
