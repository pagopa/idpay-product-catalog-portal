import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const loadLogger = async () => {
  vi.resetModules();
  return await import('./logger');
};

const setDev = (dev: boolean) => {
  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  meta.env = meta.env ?? {};
  meta.env.DEV = dev;
};

describe('logger', () => {
  const originalDebug = console.debug;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;

  beforeEach(() => {
    console.debug = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.debug = originalDebug;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('does nothing when not in DEV', async () => {
    setDev(false);

    const { logger } = await loadLogger();

    logger.debug('hello');
    logger.info('hello');
    logger.warn('hello');
    logger.error('hello');

    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each<[LogLevel, (s: string) => void]>([
    ['debug', (m) => console.debug(m)],
    ['info', (m) => console.info(m)],
    ['warn', (m) => console.warn(m)],
    ['error', (m) => console.error(m)]
  ])('logs sanitized message in DEV for %s level', async (level) => {
    setDev(true);

    const { logger } = await loadLogger();

    const messageWithNewLines = 'line1\nline2\rline3';
    const expected = 'line1 line2 line3';

    logger[level](messageWithNewLines);

    switch (level) {
      case 'debug':
        expect(console.debug).toHaveBeenCalledWith(expected);
        break;
      case 'info':
        expect(console.info).toHaveBeenCalledWith(expected);
        break;
      case 'warn':
        expect(console.warn).toHaveBeenCalledWith(expected);
        break;
      case 'error':
        expect(console.error).toHaveBeenCalledWith(expected);
        break;
    }
  });

  it('stringifies non-string messages before logging (sanitizer branch)', async () => {
    setDev(true);

    const { logger } = await loadLogger();

    logger.info({ a: 1 });

    expect(console.info).toHaveBeenCalledWith('[object Object]');
  });
});
