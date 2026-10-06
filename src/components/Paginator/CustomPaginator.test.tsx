import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomPaginator from './CustomPaginator';

describe('CustomPaginator', () => {
  const sortedData = Array.from({ length: 50 }, (_, i) => ({ id: i }));

  it('renders rows per page selector and pagination text', () => {
    render(
      <CustomPaginator
        sortedData={sortedData}
        page={1}
        setPage={vi.fn()}
        ROWS_PER_PAGE={10}
        setRowsPerPage={vi.fn()}
      />
    );

    expect(screen.getByText('Elementi per pagina')).toBeInTheDocument();
    expect(screen.getByText('1 - 10 di 50')).toBeInTheDocument();
  });

  it('calls setRowsPerPage and resets page when rows per page changes', () => {
    const setRowsPerPage = vi.fn();
    const setPage = vi.fn();

    render(
      <CustomPaginator
        sortedData={sortedData}
        page={1}
        setPage={setPage}
        ROWS_PER_PAGE={10}
        setRowsPerPage={setRowsPerPage}
      />
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: '25' }));

    expect(setRowsPerPage).toHaveBeenCalledWith(25);
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it('calls setPage when next and previous buttons are clicked', () => {
    const setPage = vi.fn();

    render(
      <CustomPaginator
        sortedData={sortedData}
        page={2}
        setPage={setPage}
        ROWS_PER_PAGE={10}
        setRowsPerPage={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole('button');

    const prevButton = buttons[0];
    const nextButton = buttons[1];

    fireEvent.click(prevButton);
    expect(setPage).toHaveBeenCalledWith(1);

    fireEvent.click(nextButton);
    expect(setPage).toHaveBeenCalledWith(3);
  });

  it('disables previous button on first page', () => {
    render(
      <CustomPaginator
        sortedData={sortedData}
        page={1}
        setPage={vi.fn()}
        ROWS_PER_PAGE={10}
        setRowsPerPage={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <CustomPaginator
        sortedData={sortedData}
        page={5}
        setPage={vi.fn()}
        ROWS_PER_PAGE={10}
        setRowsPerPage={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toBeDisabled();
  });
});
