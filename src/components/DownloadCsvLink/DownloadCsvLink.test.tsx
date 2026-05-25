import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DownloadCsvLink from './DownloadCsvLink';

describe('DownloadCsvLink', () => {
  const originalFetch = global.fetch;
  const originalCreateObjectURL = window.URL.createObjectURL;
  const originalRevokeObjectURL = window.URL.revokeObjectURL;
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
    console.error = originalConsoleError;
  });

  it('renders the download button', () => {
    render(<DownloadCsvLink />);
    expect(
      screen.getByText('Scarica la lista in formato csv')
    ).toBeInTheDocument();
  });

  it('downloads csv on first successful fetch', async () => {
    const blob = new Blob(['test'], { type: 'text/csv' });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(blob),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const createObjectURLMock = vi.fn().mockReturnValue('blob:url');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    render(<DownloadCsvLink />);

    fireEvent.click(
      screen.getByText('Scarica la lista in formato csv')
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(createObjectURLMock).toHaveBeenCalledWith(blob);
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:url');
    });
  });

  it('falls back to yesterday if today file is not ok', async () => {
    const blob = new Blob(['test'], { type: 'text/csv' });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        blob: vi.fn().mockResolvedValue(blob),
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
    window.URL.revokeObjectURL = vi.fn();

    render(<DownloadCsvLink />);

    fireEvent.click(
      screen.getByText('Scarica la lista in formato csv')
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('logs error if both fetch attempts fail', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false });

    global.fetch = fetchMock as unknown as typeof fetch;

    const consoleErrorMock = vi.fn();
    console.error = consoleErrorMock;

    render(<DownloadCsvLink />);

    fireEvent.click(
      screen.getByText('Scarica la lista in formato csv')
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(consoleErrorMock).toHaveBeenCalled();
    });
  });

  it('does not trigger download if already downloading', async () => {
    const blob = new Blob(['test'], { type: 'text/csv' });

    let resolveFetch!: (value: unknown) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    const fetchMock = vi.fn().mockReturnValue(fetchPromise);
    global.fetch = fetchMock as unknown as typeof fetch;

    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
    window.URL.revokeObjectURL = vi.fn();

    render(<DownloadCsvLink />);

    const button = screen.getByText('Scarica la lista in formato csv');

    fireEvent.click(button);
    fireEvent.click(button);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch({
      ok: true,
      blob: vi.fn().mockResolvedValue(blob),
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
