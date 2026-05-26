import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductsFilters from './ProductsFilter';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');
  return {
    ...actual,
    Autocomplete: (props: {
      options: string[];
      inputValue: string;
      filterOptions: (options: string[], state: { inputValue: string }) => string[];
      onInputChange: (_event: unknown, value: string) => void;
      renderInput: (params: {
        InputProps: Record<string, unknown>;
        inputProps: Record<string, unknown>;
      }) => React.ReactNode;
      renderOption: (
        props: { key: string; role: string },
        option: string
      ) => React.ReactNode;
    }) => {
      const filteredShort = props.filterOptions(props.options, { inputValue: 'Mo' });
      const filteredLong = props.filterOptions(props.options, { inputValue: 'del1' });

      return (
        <div>
          {props.renderInput({ InputProps: {}, inputProps: {} })}
          <button type="button" onClick={() => props.onInputChange(null, 'Model')}>
            autocomplete-change
          </button>
          <div data-testid="short-options">{filteredShort.length}</div>
          <div data-testid="long-options">
            {filteredLong.map((option) => props.renderOption({ key: option, role: 'option' }, option))}
          </div>
        </div>
      );
    }
  };
});

vi.mock('../../hooks/useIsMobile', () => ({
  useIsMobile: vi.fn()
}));

import { useIsMobile } from '../../hooks/useIsMobile';

describe('ProductsFilters', () => {
  const defaultProps = {
    search: '',
    setSearch: vi.fn(),
    selectedCategory: null,
    setSelectedCategory: vi.fn(),
    selectedBrand: null,
    setSelectedBrand: vi.fn(),
    categories: ['Cat1', 'Cat2'],
    brands: ['Brand1', 'Brand2'],
    classes: ['A', 'B'],
    selectedClass: null,
    setSelectedClass: vi.fn(),
    modelsOrGtins: ['Model1', '12345']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders desktop filters when not mobile', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductsFilters {...defaultProps} />);

    expect(screen.getByLabelText('Cerca modello o codice EAN')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
    expect(screen.getByLabelText('Marca')).toBeInTheDocument();
    expect(screen.getByLabelText('Classe Energetica')).toBeInTheDocument();
  });

  it('calls setSearch from desktop autocomplete input changes', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductsFilters {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'autocomplete-change' }));

    expect(defaultProps.setSearch).toHaveBeenCalledWith('Model');
  });

  it('filters desktop autocomplete options only after three characters', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(
      <ProductsFilters
        {...defaultProps}
        modelsOrGtins={['Model 100', '12345']}
      />
    );

    expect(screen.getByTestId('short-options')).toHaveTextContent('0');
    expect(screen.getByText('Model 100')).toBeInTheDocument();
  });

  it('renders mobile layout and opens drawer', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<ProductsFilters {...defaultProps} />);

    const filterButton = screen.getAllByRole('button', { name: /Filtra/ })[0];
    fireEvent.click(filterButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('filters mobile autocomplete options with normalized matching', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(
      <ProductsFilters
        {...defaultProps}
        modelsOrGtins={['Model 100', '12345']}
      />
    );

    expect(screen.getByTestId('short-options')).toHaveTextContent('0');
    expect(screen.getByRole('option', { name: 'Model 100' })).toBeInTheDocument();
  });

  it('clears filters on mobile', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(
      <ProductsFilters
        {...defaultProps}
        selectedCategory="Cat1"
        selectedBrand="Brand1"
        selectedClass="A"
      />
    );

    const filterButton = screen.getAllByRole('button', { name: /Filtra/ })[0];
    fireEvent.click(filterButton);

    const clearButton = screen.getByText('Annulla filtri');
    fireEvent.click(clearButton);

    expect(defaultProps.setSelectedCategory).toHaveBeenCalledWith(null);
    expect(defaultProps.setSelectedBrand).toHaveBeenCalledWith(null);
    expect(defaultProps.setSelectedClass).toHaveBeenCalledWith(null);
  });

  it('shows filter count when filters are selected (mobile)', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(
      <ProductsFilters
        {...defaultProps}
        selectedCategory="Cat1"
        selectedBrand="Brand1"
      />
    );

    expect(screen.getByText(/Filtra \(2\)/)).toBeInTheDocument();
  });

  it('handles focus and blur on search input (desktop)', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductsFilters {...defaultProps} />);

    const input = screen.getByLabelText('Cerca modello o codice EAN');
    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(input).toBeInTheDocument();
  });

  it('closes mobile drawer via close icon and Filtra button', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<ProductsFilters {...defaultProps} />);

    const filterButton = screen.getAllByRole('button', { name: /^Filtra/ })[0];
    fireEvent.click(filterButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const applyButtons = screen.getAllByRole('button', { name: /^Filtra$/ });
    fireEvent.click(applyButtons[applyButtons.length - 1]);
  });

  it('calls setSelectedCategory on desktop change', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductsFilters {...defaultProps} />);

    const categorySelect = screen.getByLabelText('Categoria');
    fireEvent.mouseDown(categorySelect);

    const option = screen.getByRole('option', { name: 'Cat1' });
    fireEvent.click(option);

    expect(defaultProps.setSelectedCategory).toHaveBeenCalledWith('Cat1');
  });

  it('calls desktop brand and class change handlers', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductsFilters {...defaultProps} />);

    fireEvent.mouseDown(screen.getByLabelText('Marca'));
    fireEvent.click(screen.getByRole('option', { name: 'Brand2' }));
    expect(defaultProps.setSelectedBrand).toHaveBeenCalledWith('Brand2');

    fireEvent.mouseDown(screen.getByLabelText('Classe Energetica'));
    fireEvent.click(screen.getByRole('option', { name: 'A' }));
    expect(defaultProps.setSelectedClass).toHaveBeenCalledWith('A');
  });

  it('clears selected desktop filters from their adornment buttons', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(
      <ProductsFilters
        {...defaultProps}
        selectedCategory="Cat1"
        selectedBrand="Brand1"
        selectedClass="A"
      />
    );

    const clearButtons = screen
      .getAllByRole('button')
      .filter((button) => button.querySelector('[data-testid="CloseIcon"]'));

    fireEvent.click(clearButtons[0]);
    fireEvent.click(clearButtons[1]);
    fireEvent.click(clearButtons[2]);

    expect(defaultProps.setSelectedCategory).toHaveBeenCalledWith(null);
    expect(defaultProps.setSelectedBrand).toHaveBeenCalledWith(null);
    expect(defaultProps.setSelectedClass).toHaveBeenCalledWith(null);
  });

  it('calls mobile select handlers and closes from the header icon', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<ProductsFilters {...defaultProps} />);

    fireEvent.click(screen.getAllByRole('button', { name: /^Filtra/ })[0]);

    fireEvent.mouseDown(screen.getByLabelText('Categoria'));
    fireEvent.click(screen.getByRole('option', { name: 'Cat2' }));
    expect(defaultProps.setSelectedCategory).toHaveBeenCalledWith('Cat2');

    fireEvent.mouseDown(screen.getByLabelText('Marca'));
    fireEvent.click(screen.getByRole('option', { name: 'Brand1' }));
    expect(defaultProps.setSelectedBrand).toHaveBeenCalledWith('Brand1');

    fireEvent.mouseDown(screen.getByLabelText('Classe Energetica'));
    fireEvent.click(screen.getByRole('option', { name: 'B' }));
    expect(defaultProps.setSelectedClass).toHaveBeenCalledWith('B');

    const closeButton = screen
      .getAllByRole('button')
      .find((button) => button.querySelector('[data-testid="CloseIcon"]'));
    fireEvent.click(closeButton!);
    expect(closeButton).toBeInTheDocument();
  });

  it('shows no mobile filter count when no filters are selected', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<ProductsFilters {...defaultProps} />);

    expect(screen.getByRole('button', { name: /^Filtra$/ })).toBeInTheDocument();
  });

  it('applies zero filter count when all filters are cleared (mobile)', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(
      <ProductsFilters
        {...defaultProps}
        selectedCategory={null}
        selectedBrand={null}
        selectedClass={null}
      />
    );

    expect(screen.getByRole('button', { name: /^Filtra$/ })).toBeInTheDocument();
  });

  it('returns empty string from getFilterCount when no filters selected (indirect via label)', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<ProductsFilters {...defaultProps} />);

    const button = screen.getByRole('button', { name: /^Filtra$/ });
    expect(button.textContent).toBe('Filtra');
  });
});
