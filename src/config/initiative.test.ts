import { describe, expect, it } from 'vitest';
import { getAppConfig } from './initiative';
import {
  getInitiativeAdapter,
  getInitiativeConfig,
  INITIATIVE_NAME,
} from './initiativeResolver';

describe('initiative build configuration', () => {
  it.each(['bonusdecoder', 'bonusvalore', 'bonuselettrodomestici'])(
    'resolves the deployment path and dataset for %s',
    (id) => {
      const config = getAppConfig(id, false);
      expect(config.basePath).toBe(`/${id}/elenco-prodotti/`);
      expect(config.datasetFile).toBe(
        `product_export_${config.initiativeId}.json`,
      );
      expect(getAppConfig(id, true)).toEqual(config);
    },
  );

  it('defaults only the development server to decoder', () => {
    expect(getAppConfig(undefined, true).initiativeName).toBe('bonusdecoder');
    expect(() => getAppConfig(undefined, false)).toThrow('VITE_INITIATIVE');
  });

  it.each(['unknown', 'toString', '__proto__'])(
    'rejects unsupported initiative %s',
    (id) => {
      expect(() => getAppConfig(id, false)).toThrow('VITE_INITIATIVE');
    },
  );

  it('resolves the runtime configuration and adapter from the injected initiative', () => {
    expect(INITIATIVE_NAME).toBe('bonusdecoder');
    expect(getInitiativeConfig().initiativeName).toBe('bonusdecoder');
    expect(getInitiativeAdapter()).toBeTypeOf('function');
  });
});
