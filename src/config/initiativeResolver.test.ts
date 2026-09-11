import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildAdaptersByFolder,
  buildConfigsByFolder,
  resolveBasePath,
} from './initiativeResolver';

describe('initiativeResolver', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('builds a config registry from folder modules', () => {
    const configs = buildConfigsByFolder({
      './bonus_decoder/config.json': {
        default: {
          initiativeName: 'bonus_decoder',
          initiativeId: 'abc',
          basePath: '/bonus_decoder/',
          filters: [],
          tableColumns: [],
          datasetFile: 'x.json',
          detailFields: [],
          copy: {
            bonusLabel: 'x',
            realizationPrefix: 'x',
            searchPage: { title: 't', description: 'd' },
          },
        },
      },
    });

    expect(configs.bonus_decoder).toMatchObject({
      initiativeName: 'bonus_decoder',
      basePath: '/bonus_decoder/',
    });
  });

  it('builds an adapter registry from folder modules', () => {
    const adapters = buildAdaptersByFolder({
      './bonus_decoder/adapter.ts': {
        default: () => ({ id: '1' }),
      },
    });

    expect(typeof adapters.bonus_decoder).toBe('function');
  });

  it('supports named adapter exports', () => {
    const adapter = () => ({ id: '2' });
    const adapters = buildAdaptersByFolder({
      './bonus_decoder/adapter.ts': { adapter },
    });

    expect(adapters.bonus_decoder).toBe(adapter);
  });

  it('accepts a valid BASE_PATH format', () => {
    expect(resolveBasePath('/bonus_decoder/')).toBe('/bonus_decoder/');
  });

  it('throws on invalid BASE_PATH format', () => {
    expect(() => resolveBasePath('/bonus_decoder')).toThrow(
      /Invalid BASE_PATH configuration/,
    );
  });

  it('throws when adapter module has no valid export', () => {
    expect(() =>
      buildAdaptersByFolder({
        './bonus_decoder/adapter.ts': { notAnAdapter: true },
      }),
    ).toThrow(/Invalid adapter export/);
  });

  it('resolves the configured initiative config and adapter', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_INITIATIVE', 'bonusdecoder');
    vi.stubEnv('BASE_URL', '/');

    const {
      INITIATIVE_NAME,
      getInitiativeConfig: getRuntimeConfig,
      getInitiativeAdapter: getRuntimeAdapter,
    } = await import('./initiativeResolver');

    expect(INITIATIVE_NAME).toBe('bonusdecoder');
    expect(getRuntimeConfig()).toMatchObject({
      initiativeName: 'bonusdecoder',
      basePath: '/',
    });
    expect(typeof getRuntimeAdapter()).toBe('function');
  });

  it('throws when the initiative name does not exist in the registry', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_INITIATIVE', 'missing-initiative');

    const {
      getInitiativeConfig: getRuntimeConfig,
      getInitiativeAdapter: getRuntimeAdapter,
    } = await import('./initiativeResolver');

    expect(() => getRuntimeConfig()).toThrow(
      /No initiative configuration found for initiativeName "missing-initiative"/,
    );
    expect(() => getRuntimeAdapter()).toThrow(
      /No adapter found for initiativeName "missing-initiative"/,
    );
  });
});
