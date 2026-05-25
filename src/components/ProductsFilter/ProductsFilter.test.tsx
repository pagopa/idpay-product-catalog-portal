import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductsFilters from './ProductsFilter';

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

  it('calls setSearch when typing in search input (desktop)', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<ProductsFilters {...defaultProps} />);

    const input = screen.getByLabelText('Cerca modello o codice EAN');
    fireEvent.change(input, { target: { value: 'Model' } });

    expect(defaultProps.setSearch).toHaveBeenCalled();
  });

  it('renders mobile layout and opens drawer', () => {
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<ProductsFilters {...defaultProps} />);

    const filterButton = screen.getAllByRole('button', { name: /Filtra/ })[0];
    fireEvent.click(filterButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
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
});
