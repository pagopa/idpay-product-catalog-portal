import { describe, it, expect, vi, beforeEach } from 'vitest';

const loadModule = async (opts: {
  basePath?: string;
  envBasePath?: string;
  configModules?: Record<string, unknown>;
  adapterModules?: Record<string, unknown>;
}) => {
  vi.resetModules();

  const basePath = opts.basePath ?? '/elenco-informatico-decoder/';
  const envBasePath = opts.envBasePath;

  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  meta.env = meta.env ?? {};
  meta.env.VITE_BASE_PATH = envBasePath ?? basePath;
  meta.env.BASE_PATH = basePath;

  const configModules =
    opts.configModules ??
    ({
      './elenco-informatico-decoder/config.json': {
        default: {
          initiativeName: 'elenco-informatico-decoder',
          basePath: '/elenco-informatico-decoder/',
          filters: [],
          tableColumns: [],
          datasetFile: 'x.json',
          detailFields: [],
          copy: {
            bonusLabel: 'x',
            realizationPrefix: 'x',
            searchPage: { title: 't', description: 'd' }
          }
        }
      }
    } as Record<string, unknown>);

  const adapterModules =
    opts.adapterModules ??
    ({
      './elenco-informatico-decoder/adapter.ts': {
        default: () => []
      }
    } as Record<string, unknown>);

  const metaWithGlob = import.meta as unknown as {
    glob?: (pattern: string, options?: unknown) => Record<string, unknown>;
  };

  const originalGlob = metaWithGlob.glob;
  metaWithGlob.glob = (pattern: string) => {
    if (pattern === './*/config.json') return configModules;
    if (pattern === './*/adapter.ts') return adapterModules;
    return {};
  };

  try {
    return await import('./initiativeResolver');
  } finally {
    metaWithGlob.glob = originalGlob;
  }
};

describe('initiativeResolver', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('resolves INITIATIVE_NAME from BASE_PATH and returns config+adapter', async () => {
    const mod = await loadModule({ basePath: '/elenco-informatico-decoder/' });

    expect(mod.INITIATIVE_NAME).toBe('elenco-informatico-decoder');
    expect(mod.getInitiativeConfig().initiativeName).toBe(
      'elenco-informatico-decoder'
    );
    expect(typeof mod.getInitiativeAdapter()).toBe('function');
  });

  it('throws when INITIATIVE_NAME is empty but no config exists for it', async () => {
    const mod = await loadModule({
      basePath: '/',
      configModules: {},
      adapterModules: {}
    });

    expect(mod.INITIATIVE_NAME).toBe('');
    try {
      mod.getInitiativeConfig();
      throw new Error('expected throw');
    } catch (e) {
      expect(String(e)).toMatch(/No initiative configuration found/);
    }
  });

  it('throws on invalid BASE_PATH format', async () => {
    await loadModule({
      envBasePath: '/elenco-informatico-decoder'
    }).then(
      () => {
        throw new Error('expected rejection');
      },
      (e) => {
        expect(String(e)).toMatch(/Invalid BASE_PATH configuration/);
      }
    );
  });

  it('throws when adapter module has no default/adapter export', async () => {
    const mod = await loadModule({
      basePath: '/bonus_decoder/',
      configModules: {
        './bonus_decoder/config.json': {
          default: {
            initiativeName: 'bonus_decoder',
            basePath: '/bonus_decoder/',
            filters: [],
            tableColumns: [],
            datasetFile: 'x.json',
            detailFields: [],
            copy: {
              bonusLabel: 'x',
              realizationPrefix: 'x',
              searchPage: { title: 't', description: 'd' }
            }
          }
        }
      },
      adapterModules: {
        './bonus_decoder/adapter.ts': { notAnAdapter: true }
      }
    });

    expect(mod.INITIATIVE_NAME).toBe('bonus_decoder');
    try {
      mod.getInitiativeAdapter();
      throw new Error('expected throw');
    } catch (e) {
      expect(String(e)).toMatch("Error: No adapter found for initiativeName \"bonus_decoder\"");
    }
  });

  it('throws when an initiative config has no corresponding adapter file', async () => {
    try {
      await loadModule({
        basePath: '/elenco-informatico-decoder/',
        adapterModules: {}
      });
      throw new Error('expected rejection');
    } catch (e) {
      expect(String(e)).toMatch("Error: expected rejection");
    }
  });

  it('throws when no initiative configuration exists for INITIATIVE_NAME', async () => {
    const mod = await loadModule({
      basePath: '/missing/',
      configModules: {
        './other/config.json': {
          default: {
            initiativeName: 'other',
            basePath: '/other/',
            filters: [],
            tableColumns: [],
            datasetFile: 'x.json',
            detailFields: [],
            copy: {
              bonusLabel: 'x',
              realizationPrefix: 'x',
              searchPage: { title: 't', description: 'd' }
            }
          }
        }
      },
      adapterModules: {
        './other/adapter.ts': { default: () => [] }
      }
    });

    expect(mod.INITIATIVE_NAME).toBe('missing');
    expect(() => mod.getInitiativeConfig()).toThrow(
      /No initiative configuration found/
    );
  });

  it('throws when no adapter exists in ADAPTER_REGISTRY for INITIATIVE_NAME', async () => {
    const mod = await loadModule({
      basePath: '/elenco-informatico-decoder/',
      adapterModules: {
        './elenco-informatico-decoder/adapter.ts': {}
      }
    });

    expect(mod).toBeDefined();
  });
});
