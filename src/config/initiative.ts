import decoder from './bonus_decoder/config.json';
import valore from './bonus_valore/config.json';
import elettrodomestici from './bonus_elettrodomestici/config.json';

const initiatives = Object.fromEntries(
  [decoder, valore, elettrodomestici].map(config => [config.initiativeName, config]),
);

export const getAppConfig = (initiative: string | undefined, isDevServer: boolean) => {
  const id = initiative || (isDevServer ? 'bonusdecoder' : '');
  if (!Object.hasOwn(initiatives, id)) {
    throw new Error(`VITE_INITIATIVE must be one of: ${Object.keys(initiatives).join(', ')}. Received: "${id}"`);
  }
  return { ...initiatives[id], basePath: `/${id}/elencoprodotti/` };
};
