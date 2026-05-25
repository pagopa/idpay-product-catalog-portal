import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import DownloadCsvLink from './DownloadCsvLink';

describe('DownloadCsvLink', () => {
  it('renders without crashing', () => {
    render(<DownloadCsvLink />);
    expect(document.body).toBeInTheDocument();
  });
});
