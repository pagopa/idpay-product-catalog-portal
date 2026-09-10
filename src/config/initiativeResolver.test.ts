import { describe, it, expect } from 'vitest';
import {
  buildAdaptersByFolder,
  buildConfigsByFolder,
  resolveBasePath,
} from './initiativeResolver';

describe('initiativeResolver', () => {
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
});
