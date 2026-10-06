import { fetchWithResilience } from '../http/fetchWithResilience';
import { logger } from '../logging/logger';
import {
  getInitiativeConfig,
  getInitiativeAdapter,
  INITIATIVE_NAME,
} from '../../config/initiativeResolver.ts';
import type { UiProduct } from './types';
import { sanitizeObject, structuralValidation } from '../../utils/functions';

export const getEligibleProducts = async (): Promise<UiProduct[]> => {
  getInitiativeConfig();
  const adapter = getInitiativeAdapter();

  try {
    const { datasetFile } = getInitiativeConfig();

    if (!datasetFile) {
      throw new Error(
        `No dataset configured for initiative ${INITIATIVE_NAME}`,
      );
    }

    const response = await fetchWithResilience(
      `${import.meta.env.BASE_URL}data/${datasetFile}`,
    );

    const contentType = response.headers.get('content-type') ?? '';
    const isJson =
      contentType.includes('application/json') || contentType.includes('+json');

    if (!isJson) {
      const bodyPreview = await response.text();
      throw new Error(
        `Expected JSON for dataset "${datasetFile}" but got content-type="${contentType}". Body preview: ${bodyPreview.slice(
          0,
          200,
        )}`,
      );
    }

    const json = await response.json();
    const structurallyValid = structuralValidation(json);

    const mapped: UiProduct[] = [];

    for (const raw of structurallyValid) {
      const sanitized = sanitizeObject(raw);
      const adapted = adapter(sanitized);

      if (adapted) {
        mapped.push(adapted);
      } else {
        logger.warn('Invalid product discarded');
      }
    }

    return mapped;
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : 'Failed to load products',
    );
    return [];
  }
};
