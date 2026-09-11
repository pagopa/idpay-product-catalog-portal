import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../http/fetchWithResilience', () => ({
  fetchWithResilience: vi.fn(),
}));

vi.mock('../logging/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../utils/functions', () => ({
  sanitizeObject: vi.fn((x: unknown) => x),
  structuralValidation: vi.fn((x: unknown) => x),
  getModuleDefault: vi.fn(),
  isRecord: vi.fn(),
  parseFolderFromViteGlobPath: vi.fn(),
}));

vi.mock('../../config/initiativeResolver.ts', () => ({
  INITIATIVE_NAME: 'bonus_decoder',
  getInitiativeConfig: vi.fn(),
  getInitiativeAdapter: vi.fn(),
}));

describe('getEligibleProducts', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('maps and filters products using adapter and returns mapped list', async () => {
    const { fetchWithResilience } = await import('../http/fetchWithResilience');
    const { getInitiativeAdapter, getInitiativeConfig } = await import(
      '../../config/initiativeResolver.ts'
    );
    const { structuralValidation, sanitizeObject } = await import(
      '../../utils/functions'
    );

    (
      getInitiativeConfig as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      datasetFile: 'dataset.json',
    });

    const adapter = vi.fn((p: { id: number; name: string; valid: boolean }) =>
      p.valid ? { id: p.id, name: p.name } : null,
    );
    (
      getInitiativeAdapter as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue(adapter);
    (
      fetchWithResilience as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(
      new Response(
        JSON.stringify([
          { id: 1, name: 'A', valid: true },
          { id: 2, name: 'B', valid: false },
        ]),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );
    (
      structuralValidation as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation((x: unknown) => x);
    (sanitizeObject as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (x: unknown) => x,
    );

    const { getEligibleProducts } = await import('./productsRepository');

    const res = await getEligibleProducts();

    expect(res).toEqual([{ id: 1, name: 'A' }]);
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('returns [] and logs error when no datasetFile configured', async () => {
    const { logger } = await import('../logging/logger');
    const { getInitiativeConfig, INITIATIVE_NAME } = await import(
      '../../config/initiativeResolver.ts'
    );

    (
      getInitiativeConfig as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      datasetFile: '',
    });

    const { getEligibleProducts } = await import('./productsRepository');
    const res = await getEligibleProducts();

    expect(res).toEqual([]);
    expect(logger.error).toHaveBeenCalledWith(
      `No dataset configured for initiative ${INITIATIVE_NAME}`,
    );
  });

  it('returns [] and logs generic error when thrown value is not Error', async () => {
    const { fetchWithResilience } = await import('../http/fetchWithResilience');
    const { logger } = await import('../logging/logger');
    const { getInitiativeConfig, getInitiativeAdapter } = await import(
      '../../config/initiativeResolver.ts'
    );

    (
      getInitiativeConfig as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      datasetFile: 'dataset.json',
    });
    (
      getInitiativeAdapter as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue(vi.fn(() => null));
    (
      fetchWithResilience as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue('boom');

    const { getEligibleProducts } = await import('./productsRepository');
    const res = await getEligibleProducts();

    expect(res).toEqual([]);
    expect(logger.error).toHaveBeenCalledWith('Failed to load products');
  });
});
