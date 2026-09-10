import type { ProductAdapter } from '../services/products/types';
import {
  getModuleDefault,
  isRecord,
  parseFolderFromViteGlobPath,
} from '../utils/functions';

export type InitiativeConfig = {
  initiativeName: string;
  initiativeId: string;
  basePath: string;
  filters: { key: string; type: 'select' | 'text' }[];
  tableColumns: {
    key: string;
    label: string;
    sortable: boolean;
    link?: {
      type: 'eprel';
    };
  }[];
  datasetFile: string;
  detailFields: {
    key: string;
    label: string;
    formatter?: 'country';
  }[];
  copy: {
    bonusLabel: string;
    realizationPrefix: string;
    searchPage: {
      title: string;
      description: string;
    };
  };
};

export const buildConfigsByFolder = (
  configModules: Record<string, unknown> = import.meta.glob('./*/config.json', {
    eager: true,
  }),
): Record<string, InitiativeConfig> =>
  Object.fromEntries(
    Object.entries(configModules).map(([path, mod]) => {
      const folder = parseFolderFromViteGlobPath(path);
      return [folder, getModuleDefault(mod) as InitiativeConfig];
    }),
  );

export const buildAdaptersByFolder = (
  adapterModules: Record<string, unknown> = import.meta.glob('./*/adapter.ts', {
    eager: true,
  }),
): Record<string, ProductAdapter> =>
  Object.fromEntries(
    Object.entries(adapterModules).map(([path, mod]) => {
      const folder = parseFolderFromViteGlobPath(path);

      if (!isAdapterModule(mod)) {
        throw new Error(`Invalid adapter export in "${path}"`);
      }

      const adapter: ProductAdapter =
        'adapter' in mod ? mod.adapter : mod.default;
      return [folder, adapter];
    }),
  );

const configsByFolder = buildConfigsByFolder();

type AdapterModule = { adapter: ProductAdapter } | { default: ProductAdapter };

const isAdapterModule = (m: unknown): m is AdapterModule => {
  if (!isRecord(m)) return false;
  return typeof m.adapter === 'function' || typeof m.default === 'function';
};

const adaptersByFolder = buildAdaptersByFolder();

const REGISTRY: Record<string, InitiativeConfig> = Object.fromEntries(
  Object.values(configsByFolder).map((cfg) => [cfg.initiativeName, cfg]),
);

const ADAPTER_REGISTRY: Record<string, ProductAdapter> = Object.fromEntries(
  Object.entries(configsByFolder).map(([folder, cfg]) => {
    const adapter = adaptersByFolder[folder];
    if (!adapter) {
      throw new Error(
        `No adapter.ts found for initiative folder "${folder}" (initiativeName="${cfg.initiativeName}")`,
      );
    }
    return [cfg.initiativeName, adapter];
  }),
);

export const resolveBasePath = (
  basePath = import.meta.env.BASE_URL,
): string => {
  if (!basePath.startsWith('/') || !basePath.endsWith('/')) {
    throw new Error(
      `Invalid BASE_PATH configuration: "${basePath}". Must start and end with "/".`,
    );
  }

  return basePath;
};

export const INITIATIVE_NAME = import.meta.env.VITE_INITIATIVE;

export const getInitiativeConfig = (): InitiativeConfig => {
  const config = REGISTRY[INITIATIVE_NAME];

  if (!config) {
    throw new Error(
      `No initiative configuration found for initiativeName "${INITIATIVE_NAME}"`,
    );
  }

  return { ...config, basePath: resolveBasePath() };
};

export const getInitiativeAdapter = () => {
  const adapter = ADAPTER_REGISTRY[INITIATIVE_NAME];

  if (!adapter) {
    throw new Error(`No adapter found for initiativeName "${INITIATIVE_NAME}"`);
  }

  return adapter;
};
